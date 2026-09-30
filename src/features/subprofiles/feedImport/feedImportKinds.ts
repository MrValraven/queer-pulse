import type { SubprofileKind, SubprofileSection } from "../api/subprofiles.api";
import { sectionsForKind } from "../subprofile-kinds";

/** The persona kinds whose craft is a show or a channel, and so can bring an
 *  episode feed in. Podcast RSS only in v1. */
export const FEED_IMPORT_KINDS: readonly SubprofileKind[] = [
  "podcaster",
  "radio_host",
  "podcast_producer",
  "host",
  "actual_play",
  "video_creator",
];

/** The editor's pane key for the import pane; also the `?pane=` deep link. */
export const FEED_IMPORT_PANE = "import";

export function supportsFeedImport(kind: SubprofileKind): boolean {
  return FEED_IMPORT_KINDS.includes(kind);
}

/** Sections that never take episodes: the photo gallery and the links list. */
const NON_EPISODE_SECTIONS: readonly SubprofileSection[] = ["gallery", "links"];

/** The sections a kind's episodes can publish into: its own sections minus
 *  the universal gallery and links. */
export function feedImportSections(kind: SubprofileKind): SubprofileSection[] {
  return sectionsForKind(kind).filter(
    (section) => !NON_EPISODE_SECTIONS.includes(section),
  );
}

/** `episodes` when the kind has it, else the kind's first section. */
export function defaultFeedSection(kind: SubprofileKind): SubprofileSection {
  const sections = feedImportSections(kind);
  return sections.includes("episodes")
    ? "episodes"
    : (sections[0] ?? "episodes");
}
