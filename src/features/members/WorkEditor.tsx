import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WorkItem } from "./data/members";
import { WorkItemEditor } from "./WorkItemEditor";
import { useRowKeys } from "./useRowKeys";
import { Section } from "./ProfileSections";
import styles from "./ProfilePage.module.css";
import editStyles from "./ProfileEdit.module.css";

/**
 * Edit-mode twin of `SelectedWorkSection`: the same "Selected work" grid, but
 * each card is editable — title / category / year fields plus a per-item image
 * picker that uploads via `useUploadImage("work-image")`. Add and remove
 * affordances mutate the list through `onChange`, which the page threads into
 * `updateDraft({ work })` so the existing save flow's `replaceWork` PUT sends it.
 */
export function WorkEditor({
  work,
  onChange,
}: {
  work: WorkItem[];
  onChange: (next: WorkItem[]) => void;
}) {
  const { t } = useTranslation();
  const { keys, appendKey, removeKeyAt } = useRowKeys(work.length);
  function update(index: number, patch: Partial<WorkItem>) {
    onChange(
      work.map((item, rowIndex) =>
        rowIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }
  function remove(index: number) {
    removeKeyAt(index);
    onChange(work.filter((_, rowIndex) => rowIndex !== index));
  }
  function add() {
    appendKey();
    onChange([...work, { category: "", title: "", year: "", links: [] }]);
  }

  return (
    <Section
      title={t("members:content.work.title")}
      subtitle={t("members:content.work.subtitle")}
    >
      <div className={styles.workGrid}>
        {work.map((item, index) => (
          <WorkItemEditor
            key={keys[index]}
            item={item}
            index={index}
            onChange={(patch) => update(index, patch)}
            onRemove={() => remove(index)}
          />
        ))}
        <button type="button" className={editStyles.addWorkCard} onClick={add}>
          <FiPlus size={22} aria-hidden />
          <span>{t("members:profileEdit.work.add")}</span>
        </button>
      </div>
    </Section>
  );
}
