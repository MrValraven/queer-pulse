import { FiPlus } from "react-icons/fi";
import type { WorkItem } from "./data/members";
import { WorkItemEditor } from "./WorkItemEditor";
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
  function update(index: number, patch: Partial<WorkItem>) {
    onChange(work.map((w, i) => (i === index ? { ...w, ...patch } : w)));
  }
  function remove(index: number) {
    onChange(work.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...work, { category: "", title: "", year: "" }]);
  }

  return (
    <Section
      title="Selected work"
      subtitle="A few things, not a portfolio dump"
    >
      <div className={styles.workGrid}>
        {work.map((item, index) => (
          <WorkItemEditor
            key={index}
            item={item}
            index={index}
            onChange={(patch) => update(index, patch)}
            onRemove={() => remove(index)}
          />
        ))}
        <button type="button" className={editStyles.addWorkCard} onClick={add}>
          <FiPlus size={22} aria-hidden />
          <span>Add work</span>
        </button>
      </div>
    </Section>
  );
}
