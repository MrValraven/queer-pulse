import { useState, type KeyboardEvent } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./EditCommunityModal.module.css";

interface EditCommunityRulesProps {
  rules: string[];
  onAdd: (text: string) => void;
  onRemove: (rule: string) => void;
}

/**
 * The shared-values editor: the current rules as removable rows, plus a
 * controlled field to add a new one (Enter or the Add button). `onAdd` trims
 * and dedupes upstream, so a no-op add just leaves the field cleared.
 */
export function EditCommunityRules({
  rules,
  onAdd,
  onRemove,
}: EditCommunityRulesProps) {
  const { t } = useTranslation();
  const [draftRule, setDraftRule] = useState("");

  const commit = () => {
    const trimmed = draftRule.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraftRule("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }
  };

  return (
    <div>
      {rules.length > 0 && (
        <ul className={styles.ruleList}>
          {rules.map((rule) => (
            <li key={rule} className={styles.ruleRow}>
              <span className={styles.ruleText}>{rule}</span>
              <button
                type="button"
                className={styles.ruleRemove}
                onClick={() => onRemove(rule)}
                aria-label={t("communities:edit.rules.remove")}
              >
                <FiX aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.ruleAdd}>
        <input
          type="text"
          value={draftRule}
          onChange={(event) => setDraftRule(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("communities:edit.rules.addPlaceholder")}
          aria-label={t("communities:edit.rules.addPlaceholder")}
        />
        <Button
          variant="ghost"
          type="button"
          onClick={commit}
          disabled={!draftRule.trim()}
        >
          {t("communities:edit.rules.add")}
        </Button>
      </div>
    </div>
  );
}
