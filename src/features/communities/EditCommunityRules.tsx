import { useMemo, useState, type KeyboardEvent } from "react";
import { FiGrid, FiX } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SharedValuesPickerModal } from "./SharedValuesPickerModal";
import { SHARED_VALUE_LIBRARY } from "./startCommunity/sharedValueLibrary.data";
import styles from "./EditCommunityModal.module.css";

interface EditCommunityRulesProps {
  rules: string[];
  onAdd: (text: string) => void;
  onRemove: (rule: string) => void;
}

/**
 * The shared-values editor: the current rules as removable rows, a controlled
 * field to add a new one in the owner's own words (Enter or the Add button),
 * and the library picker behind "Browse values". `onAdd` trims and dedupes
 * upstream, so a no-op add just leaves the field cleared.
 *
 * Unlike the wizard, an existing community's rules are already plain text (the
 * shape `Community.rules` persists), so a library pick is stored as its
 * translated sentence and recognised again by matching that same text. A value
 * written before the library existed simply never matches, and stays the
 * owner's own words.
 */
export function EditCommunityRules({
  rules,
  onAdd,
  onRemove,
}: EditCommunityRulesProps) {
  const { t } = useTranslation();
  const [draftRule, setDraftRule] = useState("");
  const [isPicking, setIsPicking] = useState(false);

  const textToId = useMemo(
    () =>
      new Map(SHARED_VALUE_LIBRARY.map((entry) => [t(entry.key), entry.id])),
    [t],
  );
  const selectedIds = rules
    .map((rule) => textToId.get(rule))
    .filter((id): id is string => id !== undefined);
  const customCount = rules.length - selectedIds.length;

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
              <IconButton
                size="sm"
                className={styles.ruleRemove}
                onClick={() => onRemove(rule)}
                aria-label={t("communities:edit.rules.remove")}
              >
                <FiX aria-hidden />
              </IconButton>
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
      <div className={styles.ruleBrowse}>
        <Button
          variant="ghost"
          type="button"
          onClick={() => setIsPicking(true)}
        >
          <FiGrid size={15} aria-hidden />{" "}
          {t("communities:values.picker.cta", {
            count: SHARED_VALUE_LIBRARY.length,
          })}
        </Button>
      </div>

      {isPicking && (
        <SharedValuesPickerModal
          selectedIds={selectedIds}
          customCount={customCount}
          onClose={() => setIsPicking(false)}
          onApply={({ added, removed }) => {
            removed.forEach((entry) => onRemove(t(entry.key)));
            added.forEach((entry) => onAdd(t(entry.key)));
          }}
        />
      )}
    </div>
  );
}
