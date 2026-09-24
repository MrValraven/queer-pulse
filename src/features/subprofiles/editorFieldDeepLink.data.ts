import type { EditorPaneKey } from "./editorRail.data";
import { FIELD_ANCHOR_ID } from "./publishChecklist.data";
import type { SkinChapterDescriptor } from "./skinBlockFields.data";
import { chapterKeyForPath, skinFieldAnchorId } from "./skinFieldAnchor";
import type { EditorFieldTarget } from "./useEditorFieldJump";

/** The field a link asks the editor to open on, read once on arrival. */
export const FIELD_PARAM = "field";
/** The same param names `useEditorPane` and `useSkinChapter` read. */
export const PANE_PARAM = "pane";
export const CHAPTER_PARAM = "chapter";

/**
 * How long to wait for the target to exist before giving up quietly. Page
 * blocks chapters mount only while active, so the anchor can land a few
 * frames after the pane does. Both floors must pass, so a slow first frame
 * still gets its full frame budget.
 */
export const ANCHOR_WAIT_MIN_FRAMES = 10;
export const ANCHOR_WAIT_MIN_MS = 500;

const identity = (anchor: string): EditorFieldTarget => ({
  pane: "identity",
  anchors: [anchor],
});
const presence = (anchor: string): EditorFieldTarget => ({
  pane: "presence",
  anchors: [anchor],
});

/**
 * The Identity and Presence fields a `?field=` link can name, by the name the
 * public page's owner links use (`therapistEditLinks.data.ts`).
 */
export const META_FIELD_TARGETS: Record<string, EditorFieldTarget> = {
  avatar: identity(FIELD_ANCHOR_ID.avatar),
  displayName: identity(FIELD_ANCHOR_ID.displayName),
  tagline: identity(FIELD_ANCHOR_ID.tagline),
  bio: identity(FIELD_ANCHOR_ID.bio),
  cover: presence(FIELD_ANCHOR_ID.cover),
  accent: presence(FIELD_ANCHOR_ID.accent),
  availability: presence(FIELD_ANCHOR_ID.availability),
  ctaLabel: presence(FIELD_ANCHOR_ID.ctaLabel),
  ctaUrl: presence(FIELD_ANCHOR_ID.ctaUrl),
  socialLinks: presence(FIELD_ANCHOR_ID.socialLinks),
};

export interface DeepLinkField {
  target: EditorFieldTarget;
  /** The Page blocks chapter holding the field, when the field is one. */
  chapter: string | null;
}

/**
 * Where a `?field=` value points. On the Page blocks pane it is a `SkinData`
 * dot path ("therapist.quote"); anywhere else it is an Identity or Presence
 * field name. A dot path that a chapter edits also resolves from another pane,
 * so a link that left out `?pane=` still lands. Null for anything unknown.
 */
export function resolveDeepLinkField(
  field: string,
  activePane: EditorPaneKey,
  chapters: SkinChapterDescriptor[],
): DeepLinkField | null {
  // Own keys only, so "constructor" and friends resolve to nothing.
  const metaTarget = Object.hasOwn(META_FIELD_TARGETS, field)
    ? META_FIELD_TARGETS[field]
    : undefined;
  if (activePane !== "skinBlocks" && metaTarget) {
    return { target: metaTarget, chapter: null };
  }
  const chapter = chapterKeyForPath(chapters, field);
  if (activePane !== "skinBlocks" && !chapter) return null;
  return {
    target: { pane: "skinBlocks", anchors: [skinFieldAnchorId(field)] },
    chapter,
  };
}
