"""Isolate a voice from music with UVR MDX-Net vocal models (ONNX, CPU).

Usage: python3 utils/audio/isolate_voice.py <input audio/video> <out_dir> <model.onnx> [model2.onnx ...]

Writes <out_dir>/vocals.wav (stereo, 44.1 kHz) and <out_dir>/music.wav (the
residual). Several models are averaged (ensemble). Pure numpy STFT/iSTFT that
mirrors torch.stft(center=True, hann periodic) used to train MDX-Net.
Models: https://github.com/TRvlvr/model_repo (Kim_Vocal_2, UVR-MDX-NET-Voc_FT).
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort

SR = 44100
N_FFT, HOP, DIM_F, DIM_T = 7680, 1024, 3072, 256
CHUNK = HOP * (DIM_T - 1)
TRIM = N_FFT // 2
N_BINS = N_FFT // 2 + 1
COMPENSATE = {"Kim_Vocal_2": 1.009, "UVR-MDX-NET-Voc_FT": 1.021}
WIN = (0.5 - 0.5 * np.cos(2 * np.pi * np.arange(N_FFT) / N_FFT)).astype(np.float32)  # periodic Hann


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a:0", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).T.copy()


def stft(x):
    """x: (C, CHUNK) -> complex (C, N_BINS, DIM_T)"""
    xp = np.pad(x, ((0, 0), (N_FFT // 2, N_FFT // 2)), mode="reflect")
    idx = np.arange(DIM_T)[:, None] * HOP + np.arange(N_FFT)[None, :]
    frames = xp[:, idx] * WIN  # (C, T, N_FFT)
    return np.fft.rfft(frames, axis=-1).transpose(0, 2, 1)


def istft(X):
    """X: complex (C, N_BINS, DIM_T) -> (C, CHUNK)"""
    frames = np.fft.irfft(X.transpose(0, 2, 1), n=N_FFT, axis=-1) * WIN  # (C, T, N_FFT)
    C = X.shape[0]
    length = N_FFT + HOP * (DIM_T - 1)
    y = np.zeros((C, length), np.float64)
    wsum = np.zeros(length, np.float64)
    for t in range(DIM_T):
        y[:, t * HOP:t * HOP + N_FFT] += frames[:, t]
        wsum[t * HOP:t * HOP + N_FFT] += WIN ** 2
    y /= np.maximum(wsum, 1e-8)
    return y[:, N_FFT // 2:N_FFT // 2 + CHUNK]


def to_model(X):
    """complex (2, N_BINS, T) -> (4, DIM_F, T) as [L re, L im, R re, R im]"""
    return np.stack([X[0].real, X[0].imag, X[1].real, X[1].imag])[:, :DIM_F].astype(np.float32)


def from_model(S):
    full = np.zeros((4, N_BINS, DIM_T), np.float32)
    full[:, :DIM_F] = S
    return np.stack([full[0] + 1j * full[1], full[2] + 1j * full[3]])


def separate(mix, model_path):
    sess = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    n = mix.shape[1]
    gen = CHUNK - 2 * TRIM
    pad = gen - n % gen
    mp = np.concatenate([np.zeros((2, TRIM)), mix, np.zeros((2, pad)), np.zeros((2, TRIM))], 1).astype(np.float32)
    out = []
    for i in range(0, n + pad, gen):
        spec = to_model(stft(mp[:, i:i + CHUNK]))[None]
        # "denoise": average the prediction for x and -x (cancels model noise)
        pred = 0.5 * (sess.run(None, {"input": spec})[0] - sess.run(None, {"input": -spec})[0])
        wave = istft(from_model(pred[0]))
        out.append(wave[:, TRIM:-TRIM])
    voc = np.concatenate(out, 1)[:, :n]
    return voc * COMPENSATE.get(Path(model_path).stem, 1.0)


def write(path, x):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[0]), "-i", "-", "-c:a", "pcm_s24le", str(path)],
                   input=x.T.astype(np.float32).tobytes(), check=True)


def main():
    src, out_dir, models = sys.argv[1], Path(sys.argv[2]), sys.argv[3:]
    out_dir.mkdir(parents=True, exist_ok=True)
    mix = load(src)
    vocs = []
    for m in models:
        v = separate(mix, m)
        write(out_dir / f"vocals_{Path(m).stem}.wav", v)
        vocs.append(v)
        print("separated with", Path(m).stem)
    voc = np.mean(vocs, axis=0)
    write(out_dir / "vocals.wav", voc)
    write(out_dir / "music.wav", mix - voc)
    print("wrote", out_dir / "vocals.wav", out_dir / "music.wav")


if __name__ == "__main__":
    main()
