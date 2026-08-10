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
 * renders — "never lies" because it's the same renderer, just fed the
 * signed-in owner's SAVED draft (`subprofile`, the editor's query-cache
 * value) adapted to the public-view shape via `ownerViewToShowcaseView`. It
 * refreshes whenever that cache value changes after a pane save; there is no
 * live-keystroke wiring here by design (documented follow-up).
 */
export function EditorPreview({ subprofile }: { subprofile: SubprofileView }) {
  const { t } = useTranslation();
  const { profile } = useProfileData();

  const skin = skinFor(subprofile.kind);
  const data = ownerViewToShowcaseView(subprofile, profile.slug);
  const accentTokens = ACCENT_TOKENS[subprofile.accent ?? DEFAULT_ACCENT];
  const skinVars = {
    "--sk-tint": accentTokens.tint,
    "--sk-on": accentTokens.on,
  } as CSSProperties;
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
