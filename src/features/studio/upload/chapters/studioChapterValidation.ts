import { STUDIO_LISTENING_LIMITS } from "../../api/studio.types";
import { parseChapterTime } from "./studioChapterTime";
import type { ChapterDraft } from "./studioTracklist";

const { chaptersMax, chapterTitleMax, chapterArtistMax } =
  STUDIO_LISTENING_LIMITS;

/** Contract A.1's chapter, as PATCH /studio/tracks/:id sends it. */
export interface ChapterSaveItem {
  startSeconds: number;
  title: string;
  artist: string | null;
}

export type ChapterRowError =
  | "time"
  | "firstAtZero"
  | "order"
  | "pastEnd"
  | "titleRequired"
  | "titleTooLong"
  | "artistTooLong";

export const CHAPTER_ERROR_KEY: Record<ChapterRowError | "tooMany", string> = {
  time: "studio:chapters.error.time",
  firstAtZero: "studio:chapters.error.firstAtZero",
  order: "studio:chapters.error.order",
  pastEnd: "studio:chapters.error.pastEnd",
  titleRequired: "studio:chapters.error.titleRequired",
  titleTooLong: "studio:chapters.error.titleTooLong",
  artistTooLong: "studio:chapters.error.artistTooLong",
  tooMany: "studio:chapters.error.tooMany",
};

export interface ChapterValidation {
  rowErrors: ChapterRowError[][];
  listError: "tooMany" | null;
  isValid: boolean;
  /** Set only when valid; an empty array means "no chapters". */
  chapters: ChapterSaveItem[] | null;
}

/** Contract A.5's chapter rules, per row, so the editor can show each one
 *  under the field it concerns. Plan 2's `areChaptersWellFormed` answers one
 *  boolean for the list (the demo and the save path use it); this exists for
 *  the per-row, per-field messages. */
export function validateChapters(
  rows: readonly ChapterDraft[],
  durationSeconds: number | null,
): ChapterValidation {
  let previousStart: number | null = null;
  const rowErrors = rows.map((row, index) => {
    const errors: ChapterRowError[] = [];
    const start = parseChapterTime(row.time);
    if (start === null) errors.push("time");
    else {
      if (index === 0 && start !== 0) errors.push("firstAtZero");
      if (index > 0 && previousStart !== null && start <= previousStart)
        errors.push("order");
      if (durationSeconds !== null && start >= durationSeconds)
        errors.push("pastEnd");
      previousStart = start;
    }
    const title = row.title.trim();
    if (!title) errors.push("titleRequired");
    else if (title.length > chapterTitleMax) errors.push("titleTooLong");
    if (row.artist.trim().length > chapterArtistMax)
      errors.push("artistTooLong");
    return errors;
  });
  const listError = rows.length > chaptersMax ? "tooMany" : null;
  const isValid =
    listError === null && rowErrors.every((errors) => errors.length === 0);
  return {
    rowErrors,
    listError,
    isValid,
    chapters: isValid
      ? rows.map((row) => ({
          startSeconds: parseChapterTime(row.time) ?? 0,
          title: row.title.trim(),
          artist: row.artist.trim() || null,
        }))
      : null,
  };
}
