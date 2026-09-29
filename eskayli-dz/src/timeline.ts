// Typed access to config/timeline.json — the single source of truth (built from the voice's
// word timestamps by utils/build_timeline.py). Every cue in the film is a spoken word.
import raw from "../config/timeline.json";

export type Word = { w: string; phrase: number; start: number; end: number };
export type Phrase = { id: number; section: string; text: string; start: number; end: number; take: string };
export type ChapterId =
  | "c01_hook" | "c02_question" | "c03_problem" | "c04_business" | "c05_eskayli"
  | "c06_system" | "c07_testing" | "c08_outcome" | "c09_idea" | "c10_brand";

type Timeline = {
  fps: number; width: number; height: number; duration: number; frames: number;
  phrases: Phrase[]; words: Word[]; chapters: Record<ChapterId, [number, number]>;
};

export const TL = raw as unknown as Timeline;
export const ph = (id: number) => TL.phrases.find((p) => p.id === id)!;
export const chapter = (id: ChapterId) => TL.chapters[id];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9&]/g, "");

/** The `nth` word of phrase `id` starting with `prefix` (accents / punctuation ignored). */
export const word = (id: number, prefix: string, nth = 0): Word => {
  const p = norm(prefix);
  const ws = TL.words.filter((w) => w.phrase === id && norm(w.w).startsWith(p));
  if (!ws[nth]) throw new Error(`word "${prefix}" #${nth} not in phrase ${id}`);
  return ws[nth];
};
/** Start time of that word. */
export const at = (id: number, prefix: string, nth = 0) => word(id, prefix, nth).start;
export const phraseWords = (id: number) => TL.words.filter((w) => w.phrase === id);
