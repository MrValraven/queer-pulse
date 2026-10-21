import type { StudioTrackView } from "../api/studio.adapters";

/** What a lyric card shows where the line goes. Shown: the words. Warned:
 *  the track sits behind a content warning, so the card never shows its
 *  words (spec 6.2). Withheld: a copyright claim holds the track offline.
 *  Hidden: the member hides explicit tracks. Missing: the line is no longer
 *  in the track's timed lyrics (edited or taken out since the share). */
export type StudioLyricLineState =
  "shown" | "warned" | "withheld" | "hidden" | "missing";

export interface StudioLyricLine {
  state: StudioLyricLineState;
  /** The line's words; null in every state but `shown`. */
  text: string | null;
}

/** The note a card shows in place of the words, by state. */
export const LYRIC_NOTE_KEY: Readonly<
  Record<Exclude<StudioLyricLineState, "shown">, string>
> = {
  warned: "studio:share.lyric.warnedNote",
  withheld: "studio:share.lyric.withheldNote",
  hidden: "studio:share.card.hiddenNote",
  missing: "studio:share.lyric.missingNote",
};

/** Reads the shared line from the reader's own track read. The link holds
 *  the index only, so the words always come from what this reader may see. */
export function studioLyricLineOf(
  track: StudioTrackView,
  lineIndex: number | undefined,
  shouldHideExplicit: boolean,
): StudioLyricLine {
  if (track.isWithheld === true) return { state: "withheld", text: null };
  if ((track.contentWarnings ?? []).length > 0)
    return { state: "warned", text: null };
  if (shouldHideExplicit && track.isExplicit)
    return { state: "hidden", text: null };
  const text =
    lineIndex === undefined
      ? ""
      : (track.syncedLyrics?.[lineIndex]?.text ?? "").trim();
  return text === ""
    ? { state: "missing", text: null }
    : { state: "shown", text };
}

/** "Artist", or "Artist · Release" when the release is not a single of the
 *  same name (the track card's subtitle rule). */
export function studioLyricCredit(track: StudioTrackView): string {
  const isSingle =
    track.release.title.trim().toLocaleLowerCase() ===
    track.title.trim().toLocaleLowerCase();
  return isSingle
    ? track.release.artist.name
    : [track.release.artist.name, track.release.title].join(" · ");
}
