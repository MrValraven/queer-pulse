import { useEffect, useState } from "react";
import { FiShield } from "react-icons/fi";
import { Button, ComingSoon } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./VouchModal.module.css";

const RELATIONSHIP_KEYS = [
  "safety:vouchModal.relationship.regular",
  "safety:vouchModal.relationship.onceOrTwice",
  "safety:vouchModal.relationship.workOrVolunteer",
  "safety:vouchModal.relationship.withFriend",
];

function VouchSuccessPanel({
  spaceName,
  onDone,
}: {
  spaceName: string;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiShield size={28} />
      </div>
      <div className={styles.successTitle}>
        <Translation
          i18nKey="safety:vouchModal.success.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.successSub}>
        <Translation
          i18nKey="safety:vouchModal.success.body"
          values={{ spaceName }}
          components={{ strong: <strong /> }}
        />
      </p>
      <div className={styles.successActions}>
        <Button variant="ghost-dark" className={styles.full} onClick={onDone}>
          {t("safety:vouchModal.success.doneCta")}
        </Button>
      </div>
    </div>
  );
}

/**
 * Live-mode panel for the vouch flow — adding a member vouch has no backend
 * yet (the safe-spaces API is read-only), so live mode shows this honest
 * plum-panel notice instead of a form that would fake a submission. Demo mode
 * still renders the full relationship + note form and its animated success.
 */
function VouchComingSoon({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <ComingSoon label={t("safety:vouchModal.comingSoon.badge")} />
      <div className={styles.successTitle} style={{ marginTop: 16 }}>
        <Translation
          i18nKey="safety:vouchModal.comingSoon.title"
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.successSub}>
        {t("safety:vouchModal.comingSoon.body")}
      </p>
      <div className={styles.successActions}>
        <Button variant="ghost-dark" className={styles.full} onClick={onDone}>
          {t("safety:vouchModal.comingSoon.doneCta")}
        </Button>
      </div>
    </div>
  );
}

/**
 * Add a safety vouch for a verified space. A short relationship + note form that
 * runs loading → animated plum-panel success. Self-contained: owns its own state
 * and locks scroll while mounted. Live mode has no vouch backend, so it shows an
 * honest coming-soon panel instead of the fake-success form.
 */
export function VouchModal({
  spaceName,
  onClose,
}: {
  spaceName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [relationship, setRelationship] = useState(RELATIONSHIP_KEYS[0]!);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "done">("form");
  useScrollLock();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit = note.trim().length >= 12;

  const submit = () => {
    if (!canSubmit) return;
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 1100);
  };

  const charsLeft = 12 - note.trim().length;

  return (
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
        aria-label={t("safety:vouchModal.ariaLabel")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("safety:vouchModal.closeAriaLabel")}
        >
          ×
        </button>

        <div className={styles.scroll}>
          {!demoMode ? (
            <VouchComingSoon onDone={onClose} />
          ) : status === "done" ? (
            <VouchSuccessPanel spaceName={spaceName} onDone={onClose} />
          ) : (
            <div>
              <div className={styles.eye}>
                {t("safety:vouchModal.form.eyebrow")}
              </div>
              <div className={styles.title}>
                <Translation
                  i18nKey="safety:vouchModal.form.title"
                  values={{ spaceName }}
                  components={{ em: <em /> }}
                />
              </div>
              <p className={styles.sub}>{t("safety:vouchModal.form.lead")}</p>

              <div className={styles.label}>
                {t("safety:vouchModal.form.relationshipLabel")}
              </div>
              <div className={styles.opts}>
                {RELATIONSHIP_KEYS.map((key) => (
                  <label
                    key={key}
                    className={[
                      styles.opt,
                      relationship === key && styles.optChecked,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="radio"
                      name="vouch-relationship"
                      value={key}
                      checked={relationship === key}
                      onChange={() => setRelationship(key)}
                    />
                    {t(key)}
                  </label>
                ))}
              </div>

              <div className={styles.label}>
                {t("safety:vouchModal.form.noteLabel")}
              </div>
              <textarea
                className={styles.textarea}
                placeholder={t("safety:vouchModal.form.notePlaceholder")}
                aria-label={t("safety:vouchModal.form.noteLabel")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className={styles.counter}>
                {charsLeft > 0
                  ? t("safety:vouchModal.form.charsRemaining", {
                      count: charsLeft,
                    })
                  : t("safety:vouchModal.form.charsCount", {
                      count: note.trim().length,
                    })}
              </div>

              <div className={styles.actions}>
                <Button variant="ghost" onClick={onClose}>
                  {t("safety:vouchModal.form.cancelCta")}
                </Button>
                <Button
                  variant="primary"
                  className={styles.full}
                  onClick={submit}
                  disabled={!canSubmit || status === "loading"}
                >
                  {status === "loading"
                    ? t("safety:vouchModal.form.submitting")
                    : t("safety:vouchModal.form.submitCta")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
