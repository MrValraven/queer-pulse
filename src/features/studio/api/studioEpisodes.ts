import type { StudioReleaseView, StudioTrackRowView } from "./studio.adapters";

// The show page's episode list (spec 5.2): published episodes numbered by
// their rank in publish order, newest or oldest first, drafts apart.

export interface StudioEpisodeRowView extends StudioTrackRowView {
  /** Rank by publish time, 1 for the first episode; null on a draft. */
  number: number | null;
}

export type StudioEpisodeOrder = "newest" | "oldest";

const EXCERPT_ELLIPSIS = "…";
const CHAPTER_LINE_PATTERN = /^\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s|[-:.)|]|$)/;

function byPublishTime(left: StudioTrackRowView, right: StudioTrackRowView) {
  const leftTime = left.publishedAt ?? "";
  const rightTime = right.publishedAt ?? "";
  if (leftTime !== rightTime) return leftTime < rightTime ? -1 : 1;
  return left.position - right.position;
}

/** A row with a publish time; a missing or null one reads as unpublished. */
function isPublished(track: StudioTrackRowView): boolean {
  return typeof track.publishedAt === "string";
}

/** A listener's rows come renumbered by publish time, so `position` is the
 *  episode number (backend contract), and every row a listener receives is
 *  published: the server and the adapter already removed drafts, and a
 *  preview link of an unreleased show sends rows with no publish time yet.
 *  The owner's rows keep their stored positions, so the owner view ranks
 *  them here and keeps drafts apart. */
export function episodesOf(
  release: Pick<StudioReleaseView, "tracks" | "isOwner">,
): {
  published: StudioEpisodeRowView[];
  drafts: StudioEpisodeRowView[];
} {
  if (!release.isOwner) {
    const listenerEpisodes = release.tracks
      .filter((track) => track.isDraft !== true)
      .sort((left, right) => left.position - right.position)
      .map((track) => ({ ...track, number: track.position }));
    return { published: listenerEpisodes, drafts: [] };
  }
  const published = release.tracks
    .filter((track) => track.isDraft !== true && isPublished(track))
    .sort(byPublishTime)
    .map((track, index) => ({ ...track, number: index + 1 }));
  const drafts = release.tracks
    .filter((track) => track.isDraft === true || !isPublished(track))
    .sort((left, right) => left.position - right.position)
    .map((track) => ({ ...track, number: null }));
  return { published, drafts };
}

/** `published` comes oldest first from episodesOf. */
export function orderedEpisodes(
  published: StudioEpisodeRowView[],
  order: StudioEpisodeOrder,
): StudioEpisodeRowView[] {
  return order === "oldest" ? published : [...published].reverse();
}

/** The newest published episode with audio: what Play latest episode and a
 *  show card's Play start. */
export function latestEpisodeOf(
  release: Pick<StudioReleaseView, "tracks" | "isOwner">,
): StudioEpisodeRowView | null {
  const playable = episodesOf(release).published.filter(
    (episode) => episode.hasAudio,
  );
  return playable[playable.length - 1] ?? null;
}

/** The first paragraph of the notes with chapter lines (those starting with
 *  a timestamp) dropped, as one line, cut on the last space at or before
 *  `maxLength` characters. Mirrors toNotesExcerpt in the backend's
 *  studio-episode-rule.ts step for step. */
export function notesExcerpt(
  notes: string | null | undefined,
  maxLength = 200,
): string | null {
  const proseLines = (notes ?? "")
    .split(/\r?\n/)
    .filter((line) => !CHAPTER_LINE_PATTERN.test(line));
  const firstParagraph =
    proseLines
      .join("\n")
      .trim()
      .split(/\n\s*\n/)[0] ?? "";
  const collapsed = firstParagraph.replace(/\s+/g, " ").trim();
  if (!collapsed) return null;
  if (collapsed.length <= maxLength) return collapsed;
  const searchWindow = collapsed.slice(0, maxLength + 1);
  const lastSpace = searchWindow.lastIndexOf(" ");
  const kept =
    lastSpace > 0
      ? searchWindow.slice(0, lastSpace)
      : collapsed.slice(0, maxLength);
  return `${kept.trimEnd()}${EXCERPT_ELLIPSIS}`;
}
