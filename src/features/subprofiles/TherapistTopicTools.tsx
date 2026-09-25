import { FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TherapistTopicsEditor } from "./useTherapistTopics";
import listStyles from "./SkinListControls.module.css";
import styles from "./TherapistTopicsControl.module.css";

/** Remove for one topic: the list controls' tool button, named with the
 *  heading. It sits at the right end of the heading row, or beside "Add a
 *  line" where the heading needs the full width. Moves go through the
 *  topic's grip (its menu, a drag) or Alt+arrow from the heading. */
export function TherapistTopicTools({
  editor,
  topicIndex,
  name,
}: {
  editor: TherapistTopicsEditor;
  topicIndex: number;
  name: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${listStyles.tools} ${styles.topicTools}`}>
      <button
        type="button"
        className={listStyles.toolButton}
        aria-label={t("subprofiles:therapistTopics.removeTopic", { name })}
        onClick={() => editor.removeTopic(topicIndex)}
      >
        <FiTrash2 size={15} aria-hidden />
      </button>
    </div>
  );
}
