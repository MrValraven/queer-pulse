import { useId, useState, type KeyboardEvent } from "react";
import { FiPlus, FiX } from "react-icons/fi";
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
 * The rows are numbered by a CSS counter on the `<ol>`, which keeps the digits
 * out of the translated copy.
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
  const isAtCap = rules.length >= MAX_COMMUNITY_RULES;

  const commit = () => {
    const trimmed = draftRule.trim();
    if (!trimmed || isAtCap) return;
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
    <fieldset className={styles.section}>
      <legend className={styles.sectionLegend}>
        <span>{legend}</span>
        <span className={styles.optionalTag}>
          {t("communities:spaces.mod.form.optional")}
        </span>
      </legend>
      <div className={styles.sectionIntro}>
        <p className={styles.hint}>{hint}</p>
        {rules.length > 0 && (
          <span className={styles.ruleCount}>
            {t("communities:spaces.mod.form.rulesCount", {
              count: rules.length,
              max: MAX_COMMUNITY_RULES,
            })}
          </span>
        )}
      </div>

      {rules.length > 0 && (
        <ol className={styles.ruleList}>
          {rules.map((rule, index) => (
            <li key={`${rule}-${index}`} className={styles.ruleRow}>
              <span className={styles.ruleText}>{rule}</span>
              <IconButton
                onClick={() => remove(index)}
                aria-label={t("communities:edit.rules.remove")}
              >
                <FiX aria-hidden />
              </IconButton>
            </li>
          ))}
        </ol>
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
          placeholder={t("communities:spaces.mod.form.rulePlaceholder")}
          onChange={(event) => setDraftRule(event.target.value)}
          onKeyDown={onKeyDown}
          disabled={isAtCap}
        />
        <Button
          variant="ghost"
          type="button"
          onClick={commit}
          disabled={!draftRule.trim() || isAtCap}
        >
          <FiPlus aria-hidden />
          {t("communities:spaces.mod.form.addRule")}
        </Button>
      </div>
    </fieldset>
  );
}
