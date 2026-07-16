import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileSection } from "./api/subprofiles.api";
import {
  itemsToInputDto,
  type SubprofileItemView,
  type SubprofileSectionView,
} from "./api/subprofiles.adapters";
import { useSubprofileMutations } from "./api/useSubprofileMutations";
import { MAX_ITEMS_PER_SECTION } from "./subprofileEditor.data";
import { SubprofileItemEditor } from "./SubprofileItemEditor";
import styles from "./SubprofileEditor.module.css";

type Row = SubprofileItemView & { _uid: string };

let seq = 0;
const withUid = (item: SubprofileItemView): Row => ({
  ...item,
  _uid: `row-${seq++}`,
});

const emptyItem = (section: SubprofileSection): SubprofileItemView => ({
  section,
  title: "",
  subtitle: "",
  description: "",
  url: "",
  imageUrl: "",
  date: "",
  meta: "",
  tags: [],
});

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
  const [rows, setRows] = useState<Row[]>(() => section.items.map(withUid));
  const [dirty, setDirty] = useState(false);

  const Icon = section.icon;
  const label = t(section.labelKey);
  const atMax = rows.length >= MAX_ITEMS_PER_SECTION;
  const saving = replaceSection.isPending;

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

  async function save() {
    try {
      await replaceSection.mutateAsync({
        id: subprofileId,
        section: section.section,
        items: itemsToInputDto(rows),
      });
      setDirty(false);
      showToast(t("subprofiles:sectionEditor.toastSaved", { section: label }), "success");
    } catch {
      showToast(t("subprofiles:sectionEditor.toastError"), "error");
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
        <p className={styles.emptySection}>{t("subprofiles:sectionEditor.empty")}</p>
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
            onChange={(p) => patch(row._uid, p)}
            onRemove={() => remove(row._uid)}
            onMove={(dir) => move(row._uid, dir)}
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
            {t("subprofiles:sectionEditor.addTo", { section: label.toLowerCase() })}
          </button>
          {atMax && (
            <p className={styles.capHint}>{t("subprofiles:sectionEditor.capHint")}</p>
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
