"""ITU-R BS.1770-4 integrated loudness + a 4x-oversampled true-peak limiter."""
import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d

SR = 48000


def _k_weight(x):
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
    a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=0), axis=0)


def integrated_lufs(x):
    x = x[:, None] if x.ndim == 1 else x
    y = _k_weight(x)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    n = (len(y) - blk) // hop + 1
    sq = y ** 2
    cs = np.vstack([np.zeros((1, sq.shape[1])), np.cumsum(sq, axis=0)])
    z = np.array([(cs[i * hop + blk] - cs[i * hop]) / blk for i in range(n)])
    lk = -0.691 + 10 * np.log10(np.sum(z, axis=1) + 1e-15)
    g1 = lk > -70
    if not np.any(g1):
        return -np.inf
    l1 = -0.691 + 10 * np.log10(np.sum(np.mean(z[g1], axis=0)) + 1e-15)
    g2 = g1 & (lk > l1 - 10)
    return -0.691 + 10 * np.log10(np.sum(np.mean(z[g2], axis=0)) + 1e-15)


def true_peak_db(x):
    x = x[:, None] if x.ndim == 1 else x
    over = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(over)) + 1e-15)


def tp_limit(x, ceiling_db=-1.3, lookahead=0.005, release=0.09):
    """Lookahead limiter driven by the 4x-oversampled peak of every sample."""
    x = x[:, None] if x.ndim == 1 else x
    c = 10 ** (ceiling_db / 20)
    over = signal.resample_poly(x, 4, 1, axis=0)
    pk = np.max(np.abs(over[: len(x) * 4]).reshape(len(x), 4, x.shape[1]), axis=(1, 2))
    need = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    L = max(1, int(lookahead * SR))
    held = minimum_filter1d(need, size=2 * L + 1, mode="nearest")
    # smooth: fast attack (already looked ahead), exponential release
    a = np.exp(-1.0 / (release * SR))
    g = np.empty_like(held)
    prev = 1.0
    for i, v in enumerate(held):
        prev = v if v < prev else v + (prev - v) * a
        g[i] = prev
    # short symmetric smoothing to avoid gain-step clicks
    g = np.minimum(held, np.convolve(g, np.ones(L) / L, mode="same"))
    return x * g[:, None]
