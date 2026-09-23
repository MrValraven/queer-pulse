import { useId, useState, type KeyboardEvent } from "react";
import { FiX } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MAX_COMMUNITY_RULES } from "./startCommunity/sharedValueLibrary.data";
import styles from "./CreateSpaceForm.module.css";

const MAX_RULE_LENGTH = 300;

interface SpaceRulesFieldProps {
  /** Group legend, e.g. "Extra rules for this space". */
  legend: string;
  /** Hint under the legend, e.g. "The rules of Queer Runners already apply here." */
  hint: string;
  rules: string[];
  onChange: (rules: string[]) => void;
}

/**
 * The space's own rules, on top of whatever the parent already inherits down
 * (`CommunityInheritedRules`, rendered elsewhere). This list only ever holds
 * the space's own additions: the founding form never edits the parent's
 * rules from here, so `onChange` always carries just what a moderator typed.
 */
export function SpaceRulesField({
  legend,
  hint,
  rules,
  onChange,
}: SpaceRulesFieldProps) {
  const { t } = useTranslation();
  const addFieldId = useId();
  const [draftRule, setDraftRule] = useState("");
  const atCap = rules.length >= MAX_COMMUNITY_RULES;

  const commit = () => {
    const trimmed = draftRule.trim();
    if (!trimmed || atCap) return;
    onChange([...rules, trimmed]);
    setDraftRule("");
  };

  const remove = (index: number) =>
    onChange(rules.filter((_, ruleIndex) => ruleIndex !== index));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <p className={styles.hint}>{hint}</p>

      {rules.length > 0 && (
        <ul className={styles.ruleList}>
          {rules.map((rule, index) => (
            <li key={`${rule}-${index}`} className={styles.ruleRow}>
              <span className={styles.ruleText}>{rule}</span>
              <IconButton
                size="sm"
                onClick={() => remove(index)}
                aria-label={t("communities:edit.rules.remove")}
              >
                <FiX aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.ruleAdd}>
        <label className="visuallyHidden" htmlFor={addFieldId}>
          {t("communities:spaces.mod.form.addRule")}
        </label>
        <input
          id={addFieldId}
          type="text"
          value={draftRule}
          maxLength={MAX_RULE_LENGTH}
          onChange={(event) => setDraftRule(event.target.value)}
          onKeyDown={onKeyDown}
          disabled={atCap}
        />
        <Button
          variant="ghost"
          type="button"
          onClick={commit}
          disabled={!draftRule.trim() || atCap}
        >
          {t("communities:spaces.mod.form.addRule")}
        </Button>
      </div>
    </fieldset>
  );
}
