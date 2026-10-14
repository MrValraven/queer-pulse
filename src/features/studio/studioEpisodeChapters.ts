import {
  parseTracklist,
  type ChapterDraft,
} from "./upload/chapters/studioTracklist";

/** The time at the start of a notes line, with the optional numbering,
 *  brackets and separator Listening's tracklist parser accepts there. */
const LEADING_TIME =
  /^\s*(?:\d{1,3}[.)]\s+)?\[?(?:\d{1,2}:)?\d{1,3}:\d{2}\]?\s*(?:[-\u2013\u2014|.)]\s*)?/;

/** "Read chapters from the notes" (spec 6.2): the lines of the show notes
 *  that start with a time (`00:00 Intro`, `1:02:30 Housing in Lisbon`)
 *  become chapter rows; every other line is left out. Listening's tracklist
 *  parser reads the time, and the title is the rest of the line exactly as
 *  the member wrote it (a podcast chapter has no artist, so "Why now - and
 *  why here" stays one title with its own dash). */
export function chapterRowsFromNotes(notes: string): ChapterDraft[] {
  return notes.split(/\r\n?|\n/).flatMap((line) => {
    const [row] = parseTracklist(line).rows;
    if (!row) return [];
    const title = line.trim().replace(LEADING_TIME, "").trim();
    return [{ ...row, title, artist: "" }];
  });
}
