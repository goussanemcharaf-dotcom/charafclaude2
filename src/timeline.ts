// Typed access to config/timeline.json — the single source of truth.
// Every scene boundary, animation cue, subtitle and SFX hit is derived from
// the voiceover word timestamps written by utils/build_timeline.py.
import raw from "../config/timeline.json";

export type Word = { w: string; phrase: number; start: number; end: number };
export type Phrase = { id: number; text: string; src: [number, number]; start: number; end: number };
export type SceneId =
  | "s01_identification" | "s02_workflow" | "s03_chaos" | "s04_confusion"
  | "s05_non" | "s06_reveal" | "s07_organized" | "s08_ten_links"
  | "s09_one_link" | "s10_client" | "s11_statement" | "s12_cta";
export type CueId = keyof typeof raw.cues;

type Timeline = {
  fps: number; width: number; height: number; duration: number; frames: number;
  phrases: Phrase[]; words: Word[];
  scenes: Record<SceneId, [number, number]>;
  cues: Record<CueId, number>;
};

export const TL = raw as unknown as Timeline;

export const cue = (id: CueId) => TL.cues[id];
export const scene = (id: SceneId) => TL.scenes[id];
export const phrase = (id: number) => TL.phrases.find((p) => p.id === id)!;
export const phraseWords = (id: number) => TL.words.filter((w) => w.phrase === id);

/** Start time of the first word of `phraseId` beginning with `prefix` (case-insensitive). */
export const wordAt = (phraseId: number, prefix: string) => {
  const w = TL.words.find((x) => x.phrase === phraseId && x.w.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!w) throw new Error(`word "${prefix}" not found in phrase ${phraseId}`);
  return w.start;
};
