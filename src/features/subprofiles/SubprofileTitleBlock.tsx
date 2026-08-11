import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { personaPublicPath } from "./personaLinks.data";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * The workshop skin's decorative title block — a small `Craft/Address/
 * Sections/State` definition list, CSS-gated to only appear on `[data-skin=
 * "workshop"]` (`.pp-titleblock{display:none}` elsewhere; see
 * `persona-skins.css`). Renders unconditionally for every skin — the markup
 * is the same everywhere, the skin decides what's visible.
 *
 * "State" reads the persona's real `status`, not the view `mode`: an owner
 * previewing their own unpublished draft (the page renders it with
 * `mode="owner"`, and the Phase-3 editor with `mode="preview"`) must see
 * "Draft", never "Published". Every non-owner viewer only ever reaches a
 * published persona, so `status` is "published" for them.
 */
export function SubprofileTitleBlock({
  view,
}: {
  view: PublicSubprofileView;
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
        {view.status === "draft"
          ? t("subprofiles:status.draft")
          : t("subprofiles:status.published")}
      </dd>
    </dl>
  );
}
