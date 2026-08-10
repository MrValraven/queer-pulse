import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaPublicPath } from "./personaLinks.data";
import type { PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * The workshop skin's decorative title block — a small `Craft/Address/
 * Sections/State` definition list, CSS-gated to only appear on `[data-skin=
 * "workshop"]` (`.pp-titleblock{display:none}` elsewhere; see
 * `persona-skins.css`). Renders unconditionally for every skin — the markup
 * is the same everywhere, the skin decides what's visible.
 *
 * "State" has no real draft/published field to read here (the public/owner
 * views this renders from never carry `status` — a persona page is only
 * reachable once published): it reads "Draft" only in `preview` mode (the
 * Phase-3 editor previewing an in-progress persona), "Published" otherwise.
 */
export function SubprofileTitleBlock({
  view,
  mode,
}: {
  view: PublicSubprofileView;
  mode: PersonaViewMode;
}) {
  const { t } = useTranslation();
  return (
    <dl className="pp-titleblock">
      <dt>{t("subprofiles:hero.titleblock.craft")}</dt>
      <dd>{t(KIND_LABEL_KEYS[view.kind])}</dd>
      <dt>{t("subprofiles:hero.titleblock.address")}</dt>
      <dd>{personaPublicPath(view)}</dd>
      <dt>{t("subprofiles:hero.titleblock.sections")}</dt>
      <dd>{view.sections.length}</dd>
      <dt>{t("subprofiles:hero.titleblock.state")}</dt>
      <dd>
        {mode === "preview"
          ? t("subprofiles:status.draft")
          : t("subprofiles:status.published")}
      </dd>
    </dl>
  );
}
