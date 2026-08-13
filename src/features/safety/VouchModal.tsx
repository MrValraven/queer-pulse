import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSafeSpaceVouch } from "./api/useSafeSpaceVouch";
import { VOUCH_RELATIONSHIP_OPTIONS } from "./vouchModal.data";
import styles from "./VouchModal.module.css";

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
 * Add a safety vouch for a verified space. A short relationship + note form that
 * runs loading → animated plum-panel success. Self-contained: owns its own state
 * and locks scroll while mounted.
 *
 * Dual-mode: in LIVE mode `submit` POSTs the real vouch through
 * `useSafeSpaceVouch` (which invalidates the directory + safe-spaces read
 * queries so the new vouch appears in the list); in DEMO mode it keeps the
 * animated fake-success (no network), so the standalone prototype still runs.
 */
export function VouchModal({
  spaceSlug,
  spaceName,
  onClose,
}: {
  /** The space's listing slug — the live POST target. */
  spaceSlug: string;
  spaceName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [relationship, setRelationship] = useState(
    VOUCH_RELATIONSHIP_OPTIONS[0]!.key,
  );
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "done">("form");
  const vouch = useSafeSpaceVouch();
  useScrollLock();

  const isSubmitting = status === "loading" || vouch.isPending;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, isSubmitting]);

  const canSubmit = note.trim().length >= 12;

  const submit = () => {
    if (!canSubmit || isSubmitting) return;
    if (demoMode) {
      // Demo: no backend — keep the animated fake-success.
      setStatus("loading");
      window.setTimeout(() => setStatus("done"), 1100);
      return;
    }
    const relationshipValue = VOUCH_RELATIONSHIP_OPTIONS.find(
      (option) => option.key === relationship,
    )?.value;
    vouch.mutate(
      { slug: spaceSlug, relationship: relationshipValue, note: note.trim() },
      { onSuccess: () => setStatus("done") },
    );
  };

  const charsLeft = 12 - note.trim().length;

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
          {status === "done" ? (
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
                {VOUCH_RELATIONSHIP_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className={[
                      styles.opt,
                      relationship === option.key && styles.optChecked,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="radio"
                      name="vouch-relationship"
                      value={option.key}
                      checked={relationship === option.key}
                      onChange={() => setRelationship(option.key)}
                    />
                    {t(option.key)}
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

              {vouch.isError && (
                <p className={styles.error} role="alert">
                  {t("safety:vouchModal.form.error")}
                </p>
              )}

              <div className={styles.actions}>
                <Button variant="ghost" onClick={onClose}>
                  {t("safety:vouchModal.form.cancelCta")}
                </Button>
                <Button
                  variant="primary"
                  className={styles.full}
                  onClick={submit}
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting
                    ? t("safety:vouchModal.form.submitting")
                    : t("safety:vouchModal.form.submitCta")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
