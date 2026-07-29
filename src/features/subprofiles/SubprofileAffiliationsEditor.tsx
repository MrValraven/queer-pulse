import { useState } from "react";
import { FiPlus, FiUsers } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AffiliationInputDTO } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useAffiliations } from "./api/useAffiliations";
import { MAX_AFFILIATIONS, rolesForTargetType } from "./affiliations.data";
import { SubprofileAffiliationRow, type AffiliationRow } from "./SubprofileAffiliationRow";
import sharedStyles from "./SubprofileEditor.module.css";

let seq = 0;
const withUid = (item: AffiliationInputDTO): AffiliationRow => ({
  ...item,
  _uid: `affiliation-${seq++}`,
});

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
 * save — a rejected save surfaces the backend's message (which names the
 * offending entry) as an error toast rather than a generic failure. Saves the
 * whole list in one PUT via `useAffiliations().replace`. Mirrors
 * `SubprofileSocialLinksEditor`'s replace-all add/remove UX.
 */
export function SubprofileAffiliationsEditor({
  subprofile,
}: {
  subprofile: SubprofileView;
}) {
  const { replace } = useAffiliations(subprofile.id);
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [rows, setRows] = useState<AffiliationRow[]>(() =>
    subprofile.affiliations.map(({ targetType, targetSlug, role }) =>
      withUid({ targetType, targetSlug, role }),
    ),
  );
  const [dirty, setDirty] = useState(false);

  const atMax = rows.length >= MAX_AFFILIATIONS;
  const saving = replace.isPending;

  function patch(uid: string, patchValue: Partial<AffiliationInputDTO>) {
    setRows((cur) =>
      cur.map((row) => (row._uid === uid ? { ...row, ...patchValue } : row)),
    );
    setDirty(true);
  }
  function remove(uid: string) {
    setRows((cur) => cur.filter((row) => row._uid !== uid));
    setDirty(true);
  }
  function add() {
    if (atMax) return;
    setRows((cur) => [...cur, withUid(emptyRow())]);
    setDirty(true);
  }

  async function save() {
    try {
      const items = rows
        .filter((row) => row.targetSlug.trim())
        .map(({ targetType, targetSlug, role }) => ({
          targetType,
          targetSlug: targetSlug.trim(),
          role,
        }));
      await replace.mutateAsync(items);
      setDirty(false);
      showToast(t("subprofiles:affiliationsEditor.saved"), "success");
    } catch (error) {
      const detail =
        error instanceof Error && error.message
          ? error.message
          : t("subprofiles:affiliationsEditor.error");
      showToast(detail, "error");
    }
  }

  return (
    <section className={sharedStyles.card}>
      <div className={sharedStyles.cardHead}>
        <span className={sharedStyles.cardIcon}>
          <FiUsers size={20} aria-hidden />
        </span>
        <h2 className={sharedStyles.cardTitle}>
          {t("subprofiles:affiliationsEditor.title")}
        </h2>
      </div>
      <p className={sharedStyles.cardNote}>
        {t("subprofiles:affiliationsEditor.note")}
      </p>

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
        <Button variant="primary" onClick={() => void save()} disabled={saving || !dirty}>
          {saving
            ? t("subprofiles:affiliationsEditor.saving")
            : t("subprofiles:affiliationsEditor.save")}
        </Button>
      </div>
    </section>
  );
}
