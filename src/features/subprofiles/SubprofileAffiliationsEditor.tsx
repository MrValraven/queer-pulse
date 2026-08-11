import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AffiliationInputDTO } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  useSubprofileEditorContext,
  withAffiliationUid,
} from "./subprofileEditorContext";
import { MAX_AFFILIATIONS, rolesForTargetType } from "./affiliations.data";
import { SubprofileAffiliationRow } from "./SubprofileAffiliationRow";
import sharedStyles from "./SubprofileEditor.module.css";

const emptyRow = (): AffiliationInputDTO => ({
  targetType: "event",
  targetSlug: "",
  role: rolesForTargetType("event")[0] ?? "",
});

/**
 * Owner editor for a persona's event/community links ("Part of"): add/remove
 * rows, each a type toggle + target slug + a role scoped to that type
 * (`SubprofileAffiliationRow`), capped at `MAX_AFFILIATIONS`. Existence,
 * visibility, and block-filtering of every target are validated server-side on
 * save. Rows are CONTROLLED by `SubprofileEditorContext`
 * (`affiliationRows`/`setAffiliationRows`) — no local state and no Save
 * button; the global savebar's `saveAll()` PUTs the whole list and surfaces
 * any rejection (which names the offending entry) as an error toast. Mirrors
 * `SubprofileSocialLinksEditor`'s add/remove UX. No outer card/title of its
 * own — the editor's pane router (`EditorPaneRouter`) already renders the
 * "Part of" h2 + lede above whichever pane is active, reusing this
 * component's own `affiliationsEditor.title`/`.note` copy, so a second
 * heading here would just repeat it.
 */
export function SubprofileAffiliationsEditor({
  subprofile: _subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { affiliationRows: rows, setAffiliationRows } = useSubprofileEditorContext();

  const atMax = rows.length >= MAX_AFFILIATIONS;

  function patch(uid: string, patchValue: Partial<AffiliationInputDTO>) {
    setAffiliationRows(
      rows.map((row) => (row._uid === uid ? { ...row, ...patchValue } : row)),
    );
  }
  function remove(uid: string) {
    setAffiliationRows(rows.filter((row) => row._uid !== uid));
  }
  function add() {
    if (atMax) return;
    setAffiliationRows([...rows, withAffiliationUid(emptyRow())]);
  }

  return (
    <div className="ed-grid">
      {rows.length === 0 && (
        <p className={sharedStyles.emptySection}>
          {t("subprofiles:affiliationsEditor.empty")}
        </p>
      )}

      <div className={sharedStyles.itemsWrap}>
        {rows.map((row, index) => (
          <SubprofileAffiliationRow
            key={row._uid}
            row={row}
            index={index}
            onChange={(patchValue) => patch(row._uid, patchValue)}
            onRemove={() => remove(row._uid)}
          />
        ))}
      </div>

      <div className={sharedStyles.sectionFoot}>
        <div>
          <button
            type="button"
            className={sharedStyles.addBtn}
            onClick={add}
            disabled={atMax}
          >
            <FiPlus size={18} aria-hidden />{" "}
            {t("subprofiles:affiliationsEditor.add")}
          </button>
          {atMax && (
            <p className={sharedStyles.capHint}>
              {t("subprofiles:affiliationsEditor.capHint")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
