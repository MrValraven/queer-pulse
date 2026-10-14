import { formatChapterTime, parseChapterTime } from "./studioChapterTime";

/** One editable chapter row. Strings, so a half-typed time stays on screen. */
export interface ChapterDraft {
  id: string;
  time: string;
  title: string;
  artist: string;
}

let draftSequence = 0;
export function createChapterDraftId(): string {
  draftSequence += 1;
  return `chapter-${draftSequence}`;
}

/** Optional "01." numbering, an optional bracketed time, an optional
 *  separator after it, then the rest of the line. */
const TRACKLIST_LINE =
  /^\s*(?:\d{1,3}[.)]\s+)?\[?((?:\d{1,2}:)?\d{1,3}:\d{2})\]?(?=\s|$|[-\u2013\u2014|.)])\s*(?:[-\u2013\u2014|.)]\s*)?(.*)$/;
/** "Artist - Title": the first spaced hyphen or dash splits the two. */
const ARTIST_SEPARATOR = /\s+[-\u2013\u2014]\s+/;

export function parseTracklist(source: string): {
  rows: ChapterDraft[];
  problems: { lineNumber: number; text: string }[];
} {
  const rows: ChapterDraft[] = [];
  const problems: { lineNumber: number; text: string }[] = [];
  source.split(/\r\n?|\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const match = TRACKLIST_LINE.exec(trimmed);
    const seconds = match ? parseChapterTime(match[1] ?? "") : null;
    if (!match || seconds === null) {
      problems.push({ lineNumber: index + 1, text: trimmed });
      return;
    }
    const rest = (match[2] ?? "").trim();
    const separator = ARTIST_SEPARATOR.exec(rest);
    rows.push({
      id: createChapterDraftId(),
      time: formatChapterTime(seconds),
      artist: separator ? rest.slice(0, separator.index).trim() : "",
      title: separator
        ? rest.slice(separator.index + separator[0].length).trim()
        : rest,
    });
  });
  return { rows, problems };
}
