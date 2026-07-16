import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DEFAULT_INTERESTS, INTEREST_OPTIONS } from "./interestsEditor.data";
import styles from "./InterestsEditorModal.module.css";

/**
 * Chip multi-select for a pending member to update the interests we match
 * their vouching against. Saving runs a short simulated submit then shows a
 * plum-panel confirmation. Data is mock — selections aren't persisted.
 */
export function InterestsEditorModal({ onClose }: { onClose: () => void }) {
  useScrollLock();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(DEFAULT_INTERESTS);
  const [saved, setSaved] = useState(false);

  function toggle(interestId: string) {
    setSelected((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId],
    );
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interests-title"
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("system:interestsEditor.closeAria")}
        >
          ×
        </button>

        {saved ? (
          <div className={styles.success}>
            <div className={styles.successIcon} aria-hidden>
              <FiCheck />
            </div>
            <h2 id="interests-title" className={styles.successTitle}>
              <Translation
                i18nKey="system:interestsEditor.success.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.successSub}>
              {t("system:interestsEditor.success.sub", {
                count: selected.length,
              })}
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                {t("system:interestsEditor.success.doneCta")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.eye}>{t("system:interestsEditor.eyebrow")}</div>
            <h2 id="interests-title" className={styles.title}>
              <Translation
                i18nKey="system:interestsEditor.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.desc}>{t("system:interestsEditor.desc")}</p>

            <div className={styles.chips}>
              {INTEREST_OPTIONS.map((option) => {
                const on = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.chip} ${on ? styles.chipOn : ""}`}
                    aria-pressed={on}
                    onClick={() => toggle(option.id)}
                  >
                    {t(option.labelKey)}
                  </button>
                );
              })}
            </div>

            <div className={styles.count}>
              {t("system:interestsEditor.count", { count: selected.length })}
              {selected.length < 2
                ? ` · ${t("system:interestsEditor.pickAtLeastTwo")}`
                : ""}
            </div>

            <div className={styles.actions}>
              <Button
                variant="primary"
                disabled={selected.length < 2}
                onClick={() => setSaved(true)}
              >
                {t("system:interestsEditor.saveCta")}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                {t("system:interestsEditor.cancelCta")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
