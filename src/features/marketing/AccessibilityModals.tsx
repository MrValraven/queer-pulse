import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Select } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FLAG_ISSUE_KEYS } from "./accessibility.data";
import styles from "./AccessibilityPage.module.css";

const Check = () => (
  <svg
    viewBox="0 0 26 26"
    fill="none"
    stroke="var(--jade)"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 13l6 6L22 7" />
  </svg>
);

function ModalShell({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose: () => void;
  label: string;
}) {
  useScrollLock();
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button type="button" className={styles.modalX} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function FlagVenueModal({
  venue,
  onClose,
}: {
  venue: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [done, setDone] = useState(false);
  const [issueType, setIssueType] = useState<string | null>(null);
  return (
    <ModalShell
      onClose={onClose}
      label={t("marketing:accessibility.flagModal.ariaLabel")}
    >
      {done ? (
        <div className={styles.success}>
          <div className={styles.sucIcon}>
            <Check />
          </div>
          <h2>
            <Translation
              i18nKey="marketing:accessibility.flagModal.doneTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("marketing:accessibility.flagModal.doneBody")}</p>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("marketing:accessibility.flagModal.closeCta")}
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.modalTitle}>
            {t("marketing:accessibility.flagModal.title")}
          </div>
          <p className={styles.modalSub}>
            {t("marketing:accessibility.flagModal.sub")}
          </p>
          <div className={styles.fields}>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-venue`}
              >
                {t("marketing:accessibility.flagModal.venueLabel")}
              </label>
              <input
                id={`${fieldId}-venue`}
                className={styles.input}
                type="text"
                value={venue}
                readOnly
              />
            </div>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-issue`}
              >
                {t("marketing:accessibility.flagModal.issueTypeLabel")}
              </label>
              <Select
                id={`${fieldId}-issue`}
                placeholder={t(
                  "marketing:accessibility.flagModal.issueTypePlaceholder",
                )}
                options={FLAG_ISSUE_KEYS.map((key) => ({
                  value: key,
                  label: t(key),
                }))}
                value={issueType}
                onChange={setIssueType}
              />
            </div>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-what`}
              >
                {t("marketing:accessibility.flagModal.whatHappenedLabel")}
              </label>
              <textarea
                id={`${fieldId}-what`}
                className={styles.textarea}
                rows={3}
                placeholder={t(
                  "marketing:accessibility.flagModal.whatHappenedPlaceholder",
                )}
              />
            </div>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-when`}
              >
                {t("marketing:accessibility.flagModal.whenLabel")}
              </label>
              <input
                id={`${fieldId}-when`}
                className={styles.input}
                type="text"
                placeholder={t(
                  "marketing:accessibility.flagModal.whenPlaceholder",
                )}
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setDone(true)}
            >
              {t("marketing:accessibility.flagModal.submitCta")}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("marketing:accessibility.flagModal.cancelCta")}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

export function AccommodationsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [done, setDone] = useState(false);
  return (
    <ModalShell
      onClose={onClose}
      label={t("marketing:accessibility.accomModal.ariaLabel")}
    >
      {done ? (
        <div className={styles.success}>
          <div className={styles.sucIcon}>
            <Check />
          </div>
          <h2>
            <Translation
              i18nKey="marketing:accessibility.accomModal.doneTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("marketing:accessibility.accomModal.doneBody")}</p>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("marketing:accessibility.accomModal.closeCta")}
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.modalTitle}>
            {t("marketing:accessibility.accomModal.title")}
          </div>
          <p className={styles.modalSub}>
            {t("marketing:accessibility.accomModal.sub")}
          </p>
          <div className={styles.fields}>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-name`}
              >
                {t("marketing:accessibility.accomModal.nameLabel")}
              </label>
              <input
                id={`${fieldId}-name`}
                className={styles.input}
                type="text"
                placeholder={t(
                  "marketing:accessibility.accomModal.namePlaceholder",
                )}
              />
            </div>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-event`}
              >
                {t("marketing:accessibility.accomModal.eventLabel")}
              </label>
              <input
                id={`${fieldId}-event`}
                className={styles.input}
                type="text"
                placeholder={t(
                  "marketing:accessibility.accomModal.eventPlaceholder",
                )}
              />
            </div>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-need`}
              >
                {t("marketing:accessibility.accomModal.needLabel")}
              </label>
              <textarea
                id={`${fieldId}-need`}
                className={styles.textarea}
                rows={4}
                placeholder={t(
                  "marketing:accessibility.accomModal.needPlaceholder",
                )}
              />
            </div>
            <div>
              <label
                className={styles.fieldLabel}
                htmlFor={`${fieldId}-contact`}
              >
                {t("marketing:accessibility.accomModal.contactLabel")}
              </label>
              <input
                id={`${fieldId}-contact`}
                className={styles.input}
                type="text"
                placeholder={t(
                  "marketing:accessibility.accomModal.contactPlaceholder",
                )}
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setDone(true)}
            >
              {t("marketing:accessibility.accomModal.submitCta")}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("marketing:accessibility.accomModal.cancelCta")}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
