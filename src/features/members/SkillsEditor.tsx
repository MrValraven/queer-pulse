import { useState, type KeyboardEvent } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkillItem } from "./data/members";
import { useRowKeys } from "./useRowKeys";
import { Section } from "./ProfileSections";
import editStyles from "./ProfileEdit.module.css";
import styles from "./ProfileListEditors.module.css";

/**
 * Edit-mode twin of the read-only "Skills & offerings" section. Mirrors the
 * TagEditor's chips + input arrangement, but skills are free-text (no curated
 * vocabulary) and carry an optional `meta` detail, so the add bar has a name
 * field, an optional detail field, and an Add button. Remove with ×.
 */
export function SkillsEditor({
  skills,
  onChange,
}: {
  skills: SkillItem[];
  onChange: (next: SkillItem[]) => void;
}) {
  const { t } = useTranslation();
  const { keys, appendKey, removeKeyAt } = useRowKeys(skills.length);
  const [name, setName] = useState("");
  const [meta, setMeta] = useState("");

  function add() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    appendKey();
    onChange([...skills, { name: trimmedName, meta: meta.trim() }]);
    setName("");
    setMeta("");
  }
  function remove(index: number) {
    removeKeyAt(index);
    onChange(skills.filter((_, entryIndex) => entryIndex !== index));
  }
  function handleNameKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      add();
    }
  }

  return (
    <Section
      title={t("members:content.skills.title")}
      subtitle={t("members:profileEdit.skills.subtitle")}
    >
      <div className={editStyles.tagField}>
        {skills.length > 0 && (
          <div className={editStyles.tagEditor}>
            {skills.map((skill, index) => (
              <span key={keys[index]} className={editStyles.tag}>
                {skill.name}
                {skill.meta && (
                  <span className={styles.chipMeta}>· {skill.meta}</span>
                )}
                <button
                  type="button"
                  className={editStyles.tagRemove}
                  aria-label={t("members:profileEdit.skills.removeLabel", {
                    name: skill.name,
                  })}
                  onClick={() => remove(index)}
                >
                  <FiX size={13} aria-hidden />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={styles.addBar}>
          <input
            className={`${editStyles.inlineInput} ${styles.grow}`}
            value={name}
            placeholder={t("members:profileEdit.skills.namePlaceholder")}
            aria-label={t("members:profileEdit.skills.nameLabel")}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={handleNameKey}
          />
          <input
            className={`${editStyles.inlineInput} ${styles.growSecondary}`}
            value={meta}
            placeholder={t("members:profileEdit.skills.metaPlaceholder")}
            aria-label={t("members:profileEdit.skills.metaLabel")}
            onChange={(event) => setMeta(event.target.value)}
            onKeyDown={handleNameKey}
          />
          <Button
            type="button"
            variant="ghost"
            onClick={add}
            disabled={!name.trim()}
          >
            <FiPlus size={16} aria-hidden />{" "}
            {t("members:profileEdit.skills.add")}
          </Button>
        </div>
      </div>
    </Section>
  );
}
