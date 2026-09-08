import { useMemo, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, Modal, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COMFORTABLE_RULE_COUNT,
  MAX_COMMUNITY_RULES,
  SHARED_VALUE_LIBRARY,
  SHARED_VALUE_THEMES,
  sharedValueThemeLabelKey,
  type SharedValueEntry,
} from "./startCommunity/sharedValueLibrary.data";
import styles from "./SharedValuesPickerModal.module.css";

interface SharedValuesPickerModalProps {
  /** Ids of the library values the community already holds. */
  selectedIds: readonly string[];
  /**
   * How many values the community holds that came from somewhere other than
   * the library (words the owner wrote themselves). They cost the same room
   * against `MAX_COMMUNITY_RULES`, so the ceiling has to count them.
   */
  customCount: number;
  onClose: () => void;
  /**
   * Fired on confirm with the difference the caller has to apply. Each surface
   * stores values in its own shape (the wizard keeps i18n keys, the edit modal
   * keeps resolved text), so the picker hands back entries and lets the caller
   * decide what a value looks like once it lands.
   */
  onApply: (change: {
    added: SharedValueEntry[];
    removed: SharedValueEntry[];
  }) => void;
}

/** Case- and accent-insensitive contains, so "acao" finds "ação". */
function fold(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * The shared-values library, browsable: a search field over every value, then
 * the whole catalogue under its theme headings, each row a toggle.
 *
 * Selection is staged. Nothing reaches the community's draft until the footer
 * is confirmed, which is what lets the modal open with the values already held
 * pre-ticked and treat un-ticking one as a removal. Values the owner wrote
 * themselves are never shown here and are never touched by a confirm.
 */
export function SharedValuesPickerModal({
  selectedIds,
  customCount,
  onClose,
  onApply,
}: SharedValuesPickerModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const initialIds = useMemo(() => new Set(selectedIds), [selectedIds]);
  const [staged, setStaged] = useState<Set<string>>(() => new Set(selectedIds));

  // Translate once per render rather than per row per keystroke: the search
  // reads the same 80 strings the list renders.
  const labelled = useMemo(
    () => SHARED_VALUE_LIBRARY.map((entry) => ({ entry, label: t(entry.key) })),
    [t],
  );

  const needle = fold(query.trim());
  const matches = needle
    ? labelled.filter((row) => fold(row.label).includes(needle))
    : labelled;

  const themes = SHARED_VALUE_THEMES.map((theme) => ({
    theme,
    rows: matches.filter((row) => row.entry.theme === theme),
  })).filter((group) => group.rows.length > 0);

  const total = staged.size + customCount;
  const isFull = total >= MAX_COMMUNITY_RULES;

  const toggle = (entry: SharedValueEntry) => {
    setStaged((previous) => {
      const next = new Set(previous);
      if (next.has(entry.id)) next.delete(entry.id);
      else if (next.size + customCount < MAX_COMMUNITY_RULES)
        next.add(entry.id);
      return next;
    });
  };

  const confirm = () => {
    const added = SHARED_VALUE_LIBRARY.filter(
      (entry) => staged.has(entry.id) && !initialIds.has(entry.id),
    );
    const removed = SHARED_VALUE_LIBRARY.filter(
      (entry) => !staged.has(entry.id) && initialIds.has(entry.id),
    );
    onApply({ added, removed });
    onClose();
  };

  return (
    <Modal
      wide
      title={t("communities:values.picker.title")}
      sub={t("communities:values.picker.sub")}
      onClose={onClose}
      footer={
        <>
          <span className={styles.count}>
            {t("communities:values.picker.count", {
              count: total,
              max: MAX_COMMUNITY_RULES,
            })}
          </span>
          <Button variant="ghost" onClick={onClose}>
            {t("communities:values.picker.cancelCta")}
          </Button>
          <Button onClick={confirm}>
            {t("communities:values.picker.confirmCta")}
          </Button>
        </>
      }
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("communities:values.picker.searchPlaceholder")}
        ariaLabel={t("communities:values.picker.searchAria")}
      />

      {total > COMFORTABLE_RULE_COUNT && !isFull && (
        <p className={styles.note}>{t("communities:values.picker.longList")}</p>
      )}
      {isFull && (
        <p className={styles.note} role="status">
          {t("communities:values.picker.full", { max: MAX_COMMUNITY_RULES })}
        </p>
      )}

      {themes.length === 0 ? (
        <p className={styles.empty}>{t("communities:values.picker.empty")}</p>
      ) : (
        themes.map(({ theme, rows }) => (
          <section key={theme} className={styles.group}>
            <h4 className={styles.groupTitle}>
              {t(sharedValueThemeLabelKey(theme))}
            </h4>
            <div className={styles.rows}>
              {rows.map(({ entry, label }) => {
                const isOn = staged.has(entry.id);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={[styles.row, isOn && styles.rowOn]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={isOn}
                    disabled={!isOn && isFull}
                    onClick={() => toggle(entry)}
                  >
                    <span className={styles.box}>
                      <FiCheck size={12} aria-hidden />
                    </span>
                    <span className={styles.label}>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))
      )}
    </Modal>
  );
}
