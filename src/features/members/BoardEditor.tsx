import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button, RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { slugify } from "../subprofiles/subprofile-kinds";
import type { BoardItem } from "./data/members";
import { BOARD_KIND_OPTIONS, newBoardItem } from "./boardEditor.data";
import { useRowKeys } from "./useRowKeys";
import { Section } from "./ProfileSections";
import editStyles from "./ProfileEdit.module.css";
import styles from "./ProfileListEditors.module.css";

/**
 * Edit-mode twin of the read-only "On the board" section. Each row is a
 * looking/offering toggle plus a title, and `slug` is always derived from the
 * title so the stored `BoardItem` stays URL-safe. Add/remove mutate the list
 * through `onChange`, which the page threads into `updateDraft({ board })`.
 */
export function BoardEditor({
  board,
  onChange,
}: {
  board: BoardItem[];
  onChange: (next: BoardItem[]) => void;
}) {
  const { t } = useTranslation();
  const { keys, appendKey, removeKeyAt } = useRowKeys(board.length);

  function update(index: number, patch: Partial<BoardItem>) {
    onChange(
      board.map((entry, entryIndex) => {
        if (entryIndex !== index) return entry;
        const next = { ...entry, ...patch };
        // slug always tracks the title so links never go stale.
        if (patch.title !== undefined) next.slug = slugify(patch.title);
        return next;
      }),
    );
  }
  function remove(index: number) {
    removeKeyAt(index);
    onChange(board.filter((_, entryIndex) => entryIndex !== index));
  }
  function add() {
    appendKey();
    onChange([...board, newBoardItem()]);
  }

  return (
    <Section
      title={t("members:content.board.title")}
      subtitle={t("members:profileEdit.board.subtitle")}
    >
      <div className={styles.rows}>
        {board.map((item, index) => (
          <div className={styles.row} key={keys[index]}>
            <RadioCardGroup
              className={`${editStyles.segmented} ${styles.rowLead}`}
              optionClassName={editStyles.segment}
              checkedClassName={editStyles.segmentActive}
              ariaLabel={t("members:profileEdit.board.kindLabel")}
              value={item.kind}
              onChange={(kind) => update(index, { kind })}
              options={BOARD_KIND_OPTIONS.map((option) => ({
                id: option.value,
                render: t(option.labelKey),
              }))}
            />
            <input
              className={`${editStyles.inlineInput} ${styles.grow}`}
              value={item.title}
              placeholder={t("members:profileEdit.board.titlePlaceholder")}
              aria-label={t("members:profileEdit.board.titleLabel")}
              onChange={(event) => update(index, { title: event.target.value })}
            />
            <button
              type="button"
              className={editStyles.workRemove}
              aria-label={t("members:profileEdit.board.removeLabel", {
                title: item.title || t("members:profileEdit.board.titleLabel"),
              })}
              onClick={() => remove(index)}
            >
              <FiTrash2 size={14} aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        className={styles.addRow}
        onClick={add}
      >
        <FiPlus size={16} aria-hidden /> {t("members:profileEdit.board.add")}
      </Button>
    </Section>
  );
}
