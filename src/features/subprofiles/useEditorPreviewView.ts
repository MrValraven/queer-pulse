import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import {
  ownerViewToShowcaseView,
  type SubprofileView,
} from "./api/subprofiles.adapters";
import { personaPublicPathForOwnerOrNull } from "./personaLinks.data";
import {
  handleIsKindName,
  linkedPersonaHandleCandidate,
} from "./personaHandle";
import {
  usePersonaCreatorName,
  usePersonaCreatorSlug,
} from "./usePersonaCreatorSlug";
import { skinFor, SKIN_META } from "./subprofile-skins";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SubprofileKind } from "./api/subprofiles.api";
import { DEFAULT_ACCENT, skinVars } from "./subprofilePresence.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { overlaySectionRows } from "./editorPreviewSections";
import { usePreviewFit, type PreviewDevice } from "./usePreviewFit";

/** Kinds that render their own layout instead of their skin family's (see
 *  `SubprofilePageBody`), so the preview header names the kind itself: a
 *  therapist reads "Therapist" where the family would say "Practice". */
const KINDS_WITH_OWN_LAYOUT: ReadonlySet<SubprofileKind> =
  new Set<SubprofileKind>(["therapist"]);

/**
 * Builds `EditorPreview`'s derived state: the saved persona overlaid with the
 * in-progress editor state (meta fields, the skin-block draft, section rows),
 * the resolved skin and showcase-view data `SubprofilePageBody` renders, and
 * the "Open live" href. Also owns `usePreviewFit`'s refs, since every caller
 * needs them alongside this derived state.
 *
 * Extracted out of `EditorPreview` itself (fix round 2) to keep that
 * component under the line budget; behaviour is unchanged from before the
 * extraction.
 */
export function useEditorPreviewView(
  subprofile: SubprofileView,
  device: PreviewDevice,
) {
  const { t } = useTranslation();
  const { scrollRef, frameRef, pageRef } = usePreviewFit(device);
  const { profile } = useProfileData();
  // The meta-editor state lives in the shared editor context now, so the docked
  // preview reads the same in-progress fields the panes write.
  const {
    meta: editor,
    skinBlocks,
    sectionRows,
  } = useSubprofileEditorContext();

  // Overlay the in-progress section rows onto the saved persona's sections,
  // re-deriving `featured` the same way the DTO-to-view adapter does. Cheap:
  // memoised on `sectionRows`' identity, which only changes when a section
  // pane (or a discard, back to the stable baseline reference) actually
  // touches it.
  const sectionsOverlay = useMemo(
    () => overlaySectionRows(subprofile, sectionRows),
    [subprofile, sectionRows],
  );

  // Overlay the in-progress meta-editor fields onto the saved persona, coerced
  // back to the persisted view shape (empty string to null where the model is
  // nullable). This is what makes the card update live per keystroke.
  const liveView: SubprofileView = {
    ...subprofile,
    displayName: editor.displayName,
    tagline: editor.tagline,
    bio: editor.bio,
    // Prefer the local `blob:` preview of a freshly picked image: `avatarUrl`/
    // `coverUrl` hold the (un-fetchable) storage KEY until save, so without this
    // the pick can't render here and falls back to initials / the "Image" slot.
    avatarUrl: editor.avatarPreview || editor.avatarUrl || null,
    coverUrl: editor.coverPreview || editor.coverUrl || null,
    // Pair the crop with whichever cover is actually showing: a fresh pick's
    // own framing while it's up, else the crop saved for the committed one.
    coverCrop: editor.coverPreview ? editor.coverPreviewCrop : editor.coverCrop,
    accent: editor.accent || null,
    availability: editor.availability || null,
    ctaLabel: editor.ctaLabel,
    ctaUrl: editor.ctaUrl,
    linkVisibility: editor.link,
    visibility: editor.visibility,
    slug: editor.slug,
    handle: editor.handle || null,
    sections: sectionsOverlay.sections,
    featured: sectionsOverlay.featured,
    // Overlay the in-progress Page blocks draft and bleed toggle onto the
    // saved skinData, so skin-block edits and `data-cover-bleed` show here
    // live, before save.
    skinData: {
      ...(subprofile.skinData ?? {}),
      ...skinBlocks.buildSkinBlocks(),
      coverBleed: editor.coverBleed,
    },
  };

  // The owner half of a linked persona's address is the persona's CREATOR,
  // never whoever is looking at the editor: a co-owner building it from their
  // own slug got a link to a page that doesn't exist. Falling back to the
  // viewer's slug is only ever used for the preview's own rendering, never for
  // a link the member can follow.
  const creatorSlug = usePersonaCreatorSlug(
    subprofile.id,
    subprofile.memberCount,
  );
  const creatorName = usePersonaCreatorName(
    subprofile.id,
    subprofile.memberCount,
  );

  const skin = skinFor(liveView.kind);
  const layoutName = KINDS_WITH_OWN_LAYOUT.has(liveView.kind)
    ? t(KIND_LABEL_KEYS[liveView.kind])
    : SKIN_META[skin].name;
  // A linked persona with an empty handle previews the default the server
  // derives and stores on save (`/p/<creatorSlug>-<personaSlug>`), the same
  // address the Address pane shows. A standalone one with no handle has no
  // address, and `personaPublicPathOrNull` shows it as such.
  const previewHandle =
    liveView.handle ??
    (liveView.linkVisibility === "linked" && creatorSlug
      ? linkedPersonaHandleCandidate(creatorSlug, liveView.slug || "persona")
      : null);
  const data = ownerViewToShowcaseView(
    { ...liveView, handle: previewHandle },
    creatorSlug ?? profile.slug,
    creatorName,
  );
  const skinStyle = skinVars(liveView.accent ?? DEFAULT_ACCENT);
  // "Open live" always points at the SAVED persona's public URL: it opens what
  // is actually live, which unsaved slug/handle edits haven't changed yet, so
  // it must NOT follow the live-edited slug. Rendered only once the creator
  // slug is known.
  // Hidden while a link switch is pending (saving it retires the saved
  // address) and while a saved standalone persona still lacks a real name.
  // A saved DRAFT's address answers its owners alone until publish
  // (PRD-429), so the same link is labelled as the draft page it is
  // (`isDraftHref`) and never promises a live page.
  const savedHandle = subprofile.handle ?? "";
  const isLinkSwitchPending = editor.link !== subprofile.linkVisibility;
  const isSavedStandaloneUnnamed =
    subprofile.linkVisibility === "unlinked" &&
    (savedHandle.trim() === "" ||
      handleIsKindName(savedHandle, subprofile.kind));
  const liveHref =
    creatorSlug && !isLinkSwitchPending && !isSavedStandaloneUnnamed
      ? personaPublicPathForOwnerOrNull(subprofile, creatorSlug)
      : null;

  return {
    scrollRef,
    frameRef,
    pageRef,
    skin,
    layoutName,
    data,
    skinStyle,
    liveHref,
    isDraftHref: subprofile.status === "draft",
  };
}
