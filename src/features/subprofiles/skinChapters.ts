import type { SubprofileKind } from "./api/subprofiles.api";
import type { SkinChapterDescriptor } from "./skinBlockFields.data";
import { deriveSkinChapters } from "./derivedSkinChapters";
import { THERAPIST_CHAPTERS } from "./therapistEditorChapters.data";

/** Kinds whose Page blocks chapters are written by hand. Every other kind's
 *  are derived from its sections and family blocks. */
const HAND_WRITTEN_CHAPTERS: Partial<
  Record<SubprofileKind, SkinChapterDescriptor[]>
> = {
  therapist: THERAPIST_CHAPTERS,
};

/** Derived chapters are pure data; build each kind's once. */
const derivedChaptersCache = new Map<SubprofileKind, SkinChapterDescriptor[]>();

/** The chapters of a persona kind's Page blocks pane, one per `?chapter=`. */
export function skinChaptersForKind(
  kind: SubprofileKind,
): SkinChapterDescriptor[] {
  const handWritten = HAND_WRITTEN_CHAPTERS[kind];
  if (handWritten) return handWritten;
  const cached = derivedChaptersCache.get(kind);
  if (cached) return cached;
  const derived = deriveSkinChapters(kind);
  derivedChaptersCache.set(kind, derived);
  return derived;
}

/** Whether the persona's Page blocks pane has anything to edit. Gates its
 *  rail entry and pane. */
export function hasSkinBlocks(kind: SubprofileKind): boolean {
  return skinChaptersForKind(kind).length > 0;
}
