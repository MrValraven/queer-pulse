import { useParams } from "react-router-dom";
import { ModalSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { SubprofilePageBody } from "./SubprofilePageBody";
import { useSubprofile } from "./api/useSubprofile";
import {
  ownerViewToShowcaseView,
  type SubprofileView,
} from "./api/subprofiles.adapters";
import { skinFor } from "./subprofile-skins";
import { DEFAULT_ACCENT, skinVars } from "./subprofilePresence.data";
import type { PersonaViewMode } from "./personaSkinRender";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import styles from "./MobilePersonaPreview.module.css";

/** No-op — the tree is fully inert in `mode="preview"`, so these handlers only
 *  satisfy `SubprofilePageBody`'s prop contract and are never invoked. */
function noop() {}

const PREVIEW_MODE: PersonaViewMode = "preview";

/**
 * The mobile equivalent of the docked `EditorPreview`: the same live
 * `SubprofilePageBody` tree, but presented in a full-height `<ModalSheet wide>`
 * because the docked preview column is `display:none` ≤860px. Opened from the
 * savebar's mobile-only "Preview" button (`EditorSavebar`).
 *
 * Self-contained (mounted only while open). It reads the SAME in-progress editor
 * state the dock does — the shared meta editor off `SubprofileEditorContext`
 * overlaid onto the saved persona — so the preview updates live per keystroke,
 * exactly like the desktop dock. The saved persona is read back from the query
 * cache via `useSubprofile(id)` (a warm cache hit, no extra fetch — the editor
 * page already loaded it), which keeps the savebar free of a new `subprofile`
 * prop it can't receive through the shell.
 */
export function MobilePersonaPreview({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: subprofile } = useSubprofile(id);
  const { profile } = useProfileData();
  const { meta: editor } = useSubprofileEditorContext();

  // Guard the (practically-impossible) cache miss: this only ever mounts from
  // inside the editor, where the persona is already loaded. Renders nothing
  // rather than a broken empty sheet.
  if (!subprofile) return null;

  // Overlay the in-progress meta-editor fields onto the saved persona — the
  // exact overlay `EditorPreview` applies, so the two previews never diverge.
  const liveView: SubprofileView = {
    ...subprofile,
    displayName: editor.displayName,
    tagline: editor.tagline,
    bio: editor.bio,
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
    skinData: { ...(subprofile.skinData ?? {}), coverBleed: editor.coverBleed },
  };

  const skin = skinFor(liveView.kind);
  const data = ownerViewToShowcaseView(liveView, profile.slug);
  const skinStyle = skinVars(liveView.accent ?? DEFAULT_ACCENT);

  return (
    <ModalSheet
      wide
      onClose={onClose}
      ariaLabel={t("subprofiles:mobilePreview.ariaLabel")}
    >
      <div className={styles.frame}>
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
    </ModalSheet>
  );
}
