import { useRef, useState, type KeyboardEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { Button, ChipList } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkillItem } from "./data/members";
import { useRowKeys } from "./useRowKeys";
import { Section } from "./ProfileSections";
import editStyles from "./ProfileEdit.module.css";
import styles from "./ProfileListEditors.module.css";

/**
 * Edit-mode twin of the read-only "Skills & offerings" section. Mirrors the
 * TagEditor's add-bar arrangement, but skills are free-text (no curated
 * vocabulary) and carry an optional `meta` detail, so the add bar has a name
 * field, an optional detail field, and an Add button. The chips are the
 * shared `ChipList`.
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
  const nameInputRef = useRef<HTMLInputElement>(null);

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
      <div className={styles.skillsField}>
        <ChipList
          items={skills}
          getKey={(_, index) => keys[index] ?? String(index)}
          renderLabel={(skill) => (
            <>
              {skill.name}
              {skill.meta && (
                <span className={styles.chipMeta}> · {skill.meta}</span>
              )}
            </>
          )}
          removeLabel={(skill) =>
            t("members:profileEdit.skills.removeLabel", { name: skill.name })
          }
          onRemove={(_, index) => remove(index)}
          emptyFocusRef={nameInputRef}
        />
        <div className={styles.addBar}>
          <input
            ref={nameInputRef}
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
