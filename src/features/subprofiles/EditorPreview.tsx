import type { CSSProperties } from "react";
import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import { SubprofilePageBody } from "./SubprofilePageBody";
import { ownerViewToShowcaseView, type SubprofileView } from "./api/subprofiles.adapters";
import { personaPublicPathForOwner } from "./personaLinks.data";
import { skinFor, SKIN_META } from "./subprofile-skins";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import type { PersonaViewMode } from "./personaSkinRender";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";

/** No-op — the tree is fully inert in `mode="preview"` (Task 3), so these
 *  handlers exist only to satisfy `SubprofilePageBody`'s prop contract and
 *  are never actually invoked by anything the preview renders. */
function noop() {}

const PREVIEW_MODE: PersonaViewMode = "preview";

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
 */
export function EditorPreview({
  subprofile,
  editor,
}: {
  subprofile: SubprofileView;
  editor: SubprofileMetaEditor;
}) {
  const { t } = useTranslation();
  const { profile } = useProfileData();

  // Overlay the in-progress meta-editor fields onto the saved persona, coerced
  // back to the persisted view shape (empty string → null where the model is
  // nullable). This is what makes the card update live per keystroke.
  const liveView: SubprofileView = {
    ...subprofile,
    displayName: editor.displayName,
    tagline: editor.tagline,
    bio: editor.bio,
    avatarUrl: editor.avatarUrl || null,
    coverUrl: editor.coverUrl || null,
    accent: editor.accent || null,
    availability: editor.availability || null,
    ctaLabel: editor.ctaLabel,
    ctaUrl: editor.ctaUrl,
    linkVisibility: editor.link,
    visibility: editor.visibility,
    slug: editor.slug,
    handle: editor.handle || null,
  };

  const skin = skinFor(liveView.kind);
  const data = ownerViewToShowcaseView(liveView, profile.slug);
  const accentTokens = ACCENT_TOKENS[liveView.accent ?? DEFAULT_ACCENT];
  const skinVars = {
    "--sk-tint": accentTokens.tint,
    "--sk-on": accentTokens.on,
  } as CSSProperties;
  // "Open live" always points at the SAVED persona's public URL — it opens
  // what is actually live, which unsaved slug/handle edits haven't changed
  // yet, so it must NOT follow the live-edited slug.
  const liveHref = personaPublicPathForOwner(subprofile, profile.slug);

  return (
    <>
      <div className="ed-prev-bar">
        <span>
          {t("subprofiles:editorPreview.label")} · {SKIN_META[skin].name}
        </span>
        <Button
          variant="ghost"
          size="sm"
          href={liveHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("subprofiles:editorPreview.openLive")} <FiExternalLink aria-hidden />
        </Button>
      </div>
      <div className="ed-prev-scroll">
        <div className="ed-prev-frame zoom">
          <SubprofilePageBody
            data={data}
            skin={skin}
            mode={PREVIEW_MODE}
            skinVars={skinVars}
            onAction={noop}
            onOpenWorkAt={noop}
            onOpenWorkItem={noop}
          />
        </div>
      </div>
    </>
  );
}
