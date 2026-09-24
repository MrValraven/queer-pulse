import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { SubprofilePageBody } from "./SubprofilePageBody";
import {
  ownerViewToShowcaseView,
  type SubprofileView,
} from "./api/subprofiles.adapters";
import { personaPublicPathForOwnerOrNull } from "./personaLinks.data";
import {
  usePersonaCreatorName,
  usePersonaCreatorSlug,
} from "./usePersonaCreatorSlug";
import { skinFor, SKIN_META } from "./subprofile-skins";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { SubprofileKind } from "./api/subprofiles.api";
import { DEFAULT_ACCENT, skinVars } from "./subprofilePresence.data";
import type { PersonaViewMode } from "./personaSkinRender";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { PreviewDeviceToggle } from "./PreviewDeviceToggle";
import {
  PREVIEW_LAYOUT_WIDTH,
  usePreviewFit,
  type PreviewDevice,
} from "./usePreviewFit";

/** No-op — the tree is fully inert in `mode="preview"` (Task 3), so these
 *  handlers exist only to satisfy `SubprofilePageBody`'s prop contract and
 *  are never actually invoked by anything the preview renders. */
function noop() {}

const PREVIEW_MODE: PersonaViewMode = "preview";

/** Kinds that render their own layout instead of their skin family's (see
 *  `SubprofilePageBody`), so the preview header names the kind itself: a
 *  therapist reads "Therapist" where the family would say "Practice". */
const KINDS_WITH_OWN_LAYOUT: ReadonlySet<SubprofileKind> =
  new Set<SubprofileKind>(["therapist"]);

/**
 * The docked live preview's contents — mounted as the direct children of the
 * `.ed-preview` sticky column `SubprofileEditorPage` already lays out (that
 * outer element owns the sticky/height/flex-column shell; `.ed-prev-bar` and
 * `.ed-prev-scroll` below are its flex children, per `persona-editor.css`).
 *
 * Reuses the exact same `SubprofilePageBody` tree the public persona page
 * renders — "never lies" because it's the same renderer. It's fed the saved
 * persona (`subprofile`, the editor's query-cache value) OVERLAID with the
 * live `editor` state, so identity/presence/address edits show up in the card
 * as you type, before any save. Content the meta editor doesn't own
 * (sections/gigs/social links, edited by their own panels with their own
 * local state) still comes straight from the saved `subprofile` and only
 * refreshes after those panels save.
 *
 * The frame lays the page out at the chosen device's real width and zooms it
 * down to the dock (`usePreviewFit`), so Desktop shows the true laptop layout.
 * The Mobile / Desktop switch shows only when the viewport has room for the
 * wider Desktop dock (`canPreviewDesktop`, decided by the shell).
 */
export function EditorPreview({
  subprofile,
  device,
  canPreviewDesktop,
  onDeviceChange,
}: {
  subprofile: SubprofileView;
  device: PreviewDevice;
  canPreviewDesktop: boolean;
  onDeviceChange: (device: PreviewDevice) => void;
}) {
  const { t } = useTranslation();
  const { scrollRef, frameRef } = usePreviewFit(device);
  const { profile } = useProfileData();
  // The meta-editor state lives in the shared editor context now, so the docked
  // preview reads the same in-progress fields the panes write.
  const { meta: editor, skinBlocks } = useSubprofileEditorContext();

  // Overlay the in-progress meta-editor fields onto the saved persona, coerced
  // back to the persisted view shape (empty string → null where the model is
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
  const data = ownerViewToShowcaseView(
    liveView,
    creatorSlug ?? profile.slug,
    creatorName,
  );
  const skinStyle = skinVars(liveView.accent ?? DEFAULT_ACCENT);
  // "Open live" always points at the SAVED persona's public URL: it opens what
  // is actually live, which unsaved slug/handle edits haven't changed yet, so
  // it must NOT follow the live-edited slug. Rendered only once the creator
  // slug is known.
  const liveHref = creatorSlug
    ? personaPublicPathForOwnerOrNull(subprofile, creatorSlug)
    : null;

  return (
    <>
      <div className="ed-prev-bar">
        <span className="ed-prev-label">
          {/* A no-break space ends the lead: flex drops a plain one between
              the two spans, and screen readers need the words apart. */}
          <span className="ed-prev-label-lead">
            {`${t("subprofiles:editorPreview.label")} ·\u00a0`}
          </span>
          <span className="ed-prev-label-layout">{layoutName}</span>
        </span>
        {canPreviewDesktop && (
          <PreviewDeviceToggle device={device} onChange={onDeviceChange} />
        )}
        {liveHref && (
          <Button
            variant="ghost"
            size="sm"
            href={liveHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("subprofiles:editorPreview.openLive")}{" "}
            <FiExternalLink aria-hidden />
          </Button>
        )}
      </div>
      <div className="ed-prev-scroll" ref={scrollRef}>
        {/* `usePreviewFit` writes the frame's `zoom` onto the element itself,
            so the style object below carries only the layout width. */}
        <div
          ref={frameRef}
          className="ed-prev-frame"
          style={{ width: PREVIEW_LAYOUT_WIDTH[device] }}
        >
          <SubprofilePageBody
            data={data}
            skin={skin}
            mode={PREVIEW_MODE}
            skinVars={skinStyle}
            onAction={noop}
            onOpenWorkAt={noop}
            onOpenWorkItem={noop}
            onOpenGalleryPhoto={noop}
            onOpenPoem={noop}
          />
        </div>
      </div>
    </>
  );
}
