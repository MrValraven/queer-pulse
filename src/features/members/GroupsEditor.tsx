import { useId } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupItem } from "./data/members";
import { GROUP_ROLE_SUGGESTIONS } from "./groupsEditor.data";
import { useRowKeys } from "./useRowKeys";
import { Section } from "./ProfileSections";
import editStyles from "./ProfileEdit.module.css";
import styles from "./ProfileListEditors.module.css";

/**
 * Edit-mode twin of the read-only "Groups & circles" section. One row per
 * group: a name and a role, the role backed by a free-text `<datalist>` of
 * common roles (suggest-only — the member's own words are kept verbatim).
 * Add/remove mutate the list through `onChange`.
 */
export function GroupsEditor({
  groups,
  onChange,
}: {
  groups: GroupItem[];
  onChange: (next: GroupItem[]) => void;
}) {
  const { t } = useTranslation();
  const rolesListId = useId();
  const { keys, appendKey, removeKeyAt } = useRowKeys(groups.length);

  function update(index: number, patch: Partial<GroupItem>) {
    onChange(
      groups.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
  }
  function remove(index: number) {
    removeKeyAt(index);
    onChange(groups.filter((_, entryIndex) => entryIndex !== index));
  }
  function add() {
    appendKey();
    onChange([...groups, { name: "", role: "" }]);
  }

  return (
    <Section
      title={t("members:content.groups.title")}
      subtitle={t("members:profileEdit.groups.subtitle")}
    >
      <div className={styles.rows}>
        {groups.map((group, index) => (
          <div className={styles.row} key={keys[index]}>
            <div className={styles.rowFields}>
              <input
                className={`${editStyles.inlineInput} ${styles.grow}`}
                value={group.name}
                placeholder={t("members:profileEdit.groups.namePlaceholder")}
                aria-label={t("members:profileEdit.groups.nameLabel")}
                onChange={(event) => update(index, { name: event.target.value })}
              />
              <input
                className={`${editStyles.inlineInput} ${styles.growSecondary}`}
                value={group.role}
                list={rolesListId}
                placeholder={t("members:profileEdit.groups.rolePlaceholder")}
                aria-label={t("members:profileEdit.groups.roleLabel")}
                onChange={(event) => update(index, { role: event.target.value })}
              />
            </div>
            <button
              type="button"
              className={editStyles.workRemove}
              aria-label={t("members:profileEdit.groups.removeLabel", {
                name: group.name || t("members:profileEdit.groups.nameLabel"),
              })}
              onClick={() => remove(index)}
            >
              <FiTrash2 size={14} aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <datalist id={rolesListId}>
        {GROUP_ROLE_SUGGESTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </datalist>
      <Button
        type="button"
        variant="ghost"
        className={styles.addRow}
        onClick={add}
      >
        <FiPlus size={16} aria-hidden /> {t("members:profileEdit.groups.add")}
      </Button>
    </Section>
  );
}
