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
  commitDraftRow,
  emptyItem,
  moveRow,
  toggleRowFeature,
  withUid,
  type SubprofileEditorRow,
} from "./subprofileSectionEditorRows";
import { EditorItemRow } from "./EditorItemRow";
import { SubprofileItemDrawer } from "./SubprofileItemDrawer";
import styles from "./SubprofileEditor.module.css";

type DrawerState = { mode: "add" } | { mode: "edit"; uid: string };

/**
 * Edits one section: a collapsed `.itemrow` list (`EditorItemRow`) with
 * add/remove/reorder/feature-toggle; each item's full field set (base +
 * rich) is edited in the `SubprofileItemDrawer`. Saves the whole section in
 * one PUT via `replaceSection`; enforces `MAX_ITEMS_PER_SECTION` on Add.
 * Renders WITHOUT its own card chrome/header — `EditorPaneRouter` already
 * renders the active pane's `<h2>`/lede above this.
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
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);

  const label = t(section.labelKey);
  const atMax = rows.length >= MAX_ITEMS_PER_SECTION;
  const saving = replaceSection.isPending;
  const canFeature = section.section !== "links";
  const canInsertExamples =
    section.section !== "links" &&
    rows.length === 0 &&
    TEMPLATE_ITEMS[section.section] !== undefined;

  function touch() {
    setDirty(true);
  }
  function remove(uid: string) {
    setRows((cur) => cur.filter((r) => r._uid !== uid));
    touch();
  }
  function move(uid: string, dir: -1 | 1) {
    setRows((cur) => moveRow(cur, uid, dir));
    touch();
  }
  function insertExamples() {
    setRows(buildTemplateItems(section.section, t).map(withUid));
    touch();
  }
  function toggleFeatured(uid: string) {
    setRows((cur) => toggleRowFeature(cur, uid));
    touch();
  }

  function closeDrawer() {
    setDrawerState(null);
  }

  /** Commits the drawer's draft back into `rows` (see `commitDraftRow`). */
  function saveDraft(draft: SubprofileItemView) {
    const editingUid = drawerState?.mode === "edit" ? drawerState.uid : null;
    setRows((cur) => commitDraftRow(cur, draft, editingUid));
    touch();
    closeDrawer();
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

  const editingRow =
    drawerState?.mode === "edit"
      ? rows.find((r) => r._uid === drawerState.uid)
      : undefined;
  const drawerItem = drawerState?.mode === "add" ? emptyItem(section.section) : editingRow;

  return (
    <>
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
          <EditorItemRow
            key={row._uid}
            item={row}
            canFeature={canFeature}
            isFirst={index === 0}
            isLast={index === rows.length - 1}
            onEdit={() => setDrawerState({ mode: "edit", uid: row._uid })}
            onMoveUp={() => move(row._uid, -1)}
            onMoveDown={() => move(row._uid, 1)}
            onToggleFeature={() => toggleFeatured(row._uid)}
            onRemove={() => remove(row._uid)}
          />
        ))}
      </div>

      <div className={styles.sectionFoot}>
        <div>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setDrawerState({ mode: "add" })}
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
        <Button variant="primary" onClick={() => void save()} disabled={saving || !dirty}>
          {saving
            ? t("subprofiles:sectionEditor.saving")
            : t("subprofiles:sectionEditor.save")}
        </Button>
      </div>

      {drawerState && drawerItem && (
        <SubprofileItemDrawer
          section={section}
          item={drawerItem}
          isNew={drawerState.mode === "add"}
          canFeature={canFeature}
          onSave={saveDraft}
          onClose={closeDrawer}
        />
      )}
    </>
  );
}
