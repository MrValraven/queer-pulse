import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  itemsToInputDto,
  type SubprofileItemView,
  type SubprofileSectionView,
} from "./api/subprofiles.adapters";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { MAX_ITEMS_PER_SECTION } from "./subprofileEditor.data";
import { TEMPLATE_ITEMS, buildTemplateItems } from "./subprofileTemplates.data";
import {
  emptyItem,
  withUid,
  type SubprofileEditorRow,
} from "./subprofileSectionEditorRows";
import { SubprofileItemEditor } from "./SubprofileItemEditor";
import styles from "./SubprofileEditor.module.css";

/**
 * Edits one section of a subprofile: a list of items with add / remove / reorder,
 * each edited by `SubprofileItemEditor`. Saves the whole section in one PUT via
 * `replaceSection`. Enforces the `MAX_ITEMS_PER_SECTION` cap on the Add button.
 */
export function SubprofileSectionEditor({
  subprofileId,
  section,
}: {
  subprofileId: string;
  section: SubprofileSectionView;
}) {
  const { replaceSection } = useSubprofileMutations();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [rows, setRows] = useState<SubprofileEditorRow[]>(() =>
    section.items.map(withUid),
  );
  const [dirty, setDirty] = useState(false);

  const Icon = section.icon;
  const label = t(section.labelKey);
  const atMax = rows.length >= MAX_ITEMS_PER_SECTION;
  const saving = replaceSection.isPending;
  const canInsertExamples =
    section.section !== "links" &&
    rows.length === 0 &&
    TEMPLATE_ITEMS[section.section] !== undefined;

  function touch() {
    setDirty(true);
  }
  function patch(uid: string, p: Partial<SubprofileItemView>) {
    setRows((cur) => cur.map((r) => (r._uid === uid ? { ...r, ...p } : r)));
    touch();
  }
  function remove(uid: string) {
    setRows((cur) => cur.filter((r) => r._uid !== uid));
    touch();
  }
  function move(uid: string, dir: -1 | 1) {
    setRows((cur) => {
      const i = cur.findIndex((r) => r._uid === uid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= cur.length) return cur;
      const next = [...cur];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
    touch();
  }
  function add() {
    if (atMax) return;
    setRows((cur) => [...cur, withUid(emptyItem(section.section))]);
    touch();
  }
  function insertExamples() {
    setRows(buildTemplateItems(section.section, t).map(withUid));
    touch();
  }
  function toggleFeatured(uid: string) {
    setRows((cur) => {
      const target = cur.find((r) => r._uid === uid);
      if (!target) return cur;
      const turningOn = !target.isFeatured;
      // Single-select within THIS section's working list only — the backend
      // enforces the cross-section, persona-wide spotlight on save, clearing
      // any featured item left in other sections.
      return cur.map((r) => ({
        ...r,
        isFeatured: r._uid === uid ? turningOn : turningOn ? false : r.isFeatured,
      }));
    });
    touch();
  }

  async function save() {
    try {
      await replaceSection.mutateAsync({
        id: subprofileId,
        section: section.section,
        items: itemsToInputDto(rows),
      });
      setDirty(false);
      showToast(
        t("subprofiles:sectionEditor.toastSaved", { section: label }),
        "success",
      );
    } catch (err) {
      // A 400 names the exact problem (e.g. an unknown/blocked collaborator
      // handle) — surface that instead of the generic fallback so the owner
      // knows which chip to fix. Any other failure keeps the generic message.
      const detailedMessage =
        err instanceof ApiError && err.status === 400 ? err.message : null;
      showToast(
        detailedMessage ?? t("subprofiles:sectionEditor.toastError"),
        "error",
      );
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon}>
          <Icon size={20} aria-hidden />
        </span>
        <h2 className={styles.cardTitle}>{label}</h2>
      </div>

      {rows.length === 0 && (
        <p className={styles.emptySection}>
          {t("subprofiles:sectionEditor.empty")}
        </p>
      )}
      {canInsertExamples && (
        <Button variant="ghost" onClick={insertExamples}>
          {t("subprofiles:template.insertExamples")}
        </Button>
      )}

      <div className={styles.itemsWrap}>
        {rows.map((row, index) => (
          <SubprofileItemEditor
            key={row._uid}
            item={row}
            index={index}
            fields={section.fields}
            canMoveUp={index > 0}
            canMoveDown={index < rows.length - 1}
            canFeature={section.section !== "links"}
            onChange={(p) => patch(row._uid, p)}
            onRemove={() => remove(row._uid)}
            onMove={(dir) => move(row._uid, dir)}
            onToggleFeatured={() => toggleFeatured(row._uid)}
          />
        ))}
      </div>

      <div className={styles.sectionFoot}>
        <div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={add}
            disabled={atMax}
          >
            <FiPlus size={18} aria-hidden />{" "}
            {t("subprofiles:sectionEditor.addTo", {
              section: label.toLowerCase(),
            })}
          </button>
          {atMax && (
            <p className={styles.capHint}>
              {t("subprofiles:sectionEditor.capHint")}
            </p>
          )}
        </div>
        <Button variant="primary" onClick={save} disabled={saving || !dirty}>
          {saving
            ? t("subprofiles:sectionEditor.saving")
            : t("subprofiles:sectionEditor.save")}
        </Button>
      </div>
    </section>
  );
}
