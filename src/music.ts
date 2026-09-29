// Typed access to config/music.json, written by utils/audio/build_audio.py: the beat grid,
// every kick, the drops and the builds. The picture reacts to the same events the music
// plays, so punches, shakes and flashes land on the sound.
import raw from "../config/music.json";

export type HitKind = "hook" | "section" | "drop" | "cta" | "final";
export type Hit = { t: number; kind: HitKind };
type Music = {
  bpm_a: number; start_a: number; end_a: number;
  bpm_b: number; beat_b: number; start_b: number; end_b: number;
  kicks: Array<[number, number]>;
  hits: Hit[];
  builds: Array<[number, number]>;
  glitches: number[];
};

export const MUSIC = raw as unknown as Music;

/** Kick envelope 0..1: jumps on each kick (scaled by its strength) and decays in ~`decay` s. */
export const beatPulse = (t: number, decay = 0.09) => {
  let v = 0;
  for (const [tk, s] of MUSIC.kicks) {
    if (tk > t) break;
    if (t - tk < decay * 6) v = Math.max(v, s * Math.exp(-(t - tk) / decay));
  }
  return v;
};

/** 0..1 through a build (tension before a drop); held at 1 in the half-beat gap before the drop. */
export const buildProgress = (t: number) => {
  for (const [a, b] of MUSIC.builds) {
    if (t >= a && t < b + MUSIC.beat_b / 2) return Math.min(1, (t - a) / (b - a));
  }
  return 0;
};

export const hitTime = (kind: HitKind, nth = 0) => MUSIC.hits.filter((h) => h.kind === kind)[nth].t;
