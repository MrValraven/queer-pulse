import { useEffect, useMemo, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useCreateReport } from "./api/useCreateReport";
import { REASON_LABEL_KEYS, SUBJECT_REASONS, type ReasonCode } from "./reportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./FlagModal.module.css";

function FlagSuccessPanel({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.successIcon}>
        <svg viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className={styles.title}>
        <Translation i18nKey="safety:flag.success.title" components={{ em: <em /> }} />
      </div>
      <p className={styles.sub}>
        <Translation i18nKey="safety:flag.success.body" components={{ b: <b /> }} />
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" className={styles.full} onClick={onDone}>
          {t("safety:flag.success.doneCta")}
        </Button>
      </div>
    </div>
  );
}

export function FlagModal({
  spaceName,
  spaceId,
  onClose,
  onSubmitted,
}: {
  spaceName: string;
  /** Safe-space id — the report's `subjectId`. Falls back to the name. */
  spaceId?: string;
  onClose: () => void;
  onSubmitted?: (reason: string, detail: string) => void;
}) {
  const { t } = useTranslation();
  const reasons = useMemo(
    () =>
      SUBJECT_REASONS.venue.map((code) => ({
        code,
        label: t(REASON_LABEL_KEYS[code]),
      })),
    [t],
  );
  const [reason, setReason] = useState<ReasonCode>(reasons[0]!.code);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const createReport = useCreateReport();
  useScrollLock();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit = detail.trim().length >= 10;

  const label = (code: ReasonCode) =>
    reasons.find((r) => r.code === code)?.label ?? t("safety:flag.reasonFallback");

  const submit = () => {
    if (!canSubmit || createReport.isPending) return;
    // The "three flags → review" counter is server-derived. Demo resolves
    // locally; live POSTs /reports with subjectType "venue".
    createReport.mutate(
      {
        subjectType: "venue",
        subjectId: spaceId ?? spaceName,
        reasonCode: reason,
        detail: detail.trim(),
      },
      {
        onSuccess: () => {
          onSubmitted?.(label(reason), detail.trim());
          setDone(true);
        },
        onError: (err) => {
          logError(err, { scope: "safety.flagVenue" });
          onSubmitted?.(label(reason), detail.trim());
          setDone(true);
        },
      },
    );
  };

  const charsLeft = 10 - detail.trim().length;

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
        aria-label={t("safety:flag.modal.ariaLabel")}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("safety:flag.modal.closeAriaLabel")}
        >
          ×
        </button>

        <div className={styles.scroll}>
          {done ? (
            <FlagSuccessPanel onDone={onClose} />
          ) : (
            <div>
              <div className={styles.eye}>{t("safety:flag.form.eyebrow")}</div>
              <div className={styles.title}>
                <Translation
                  i18nKey="safety:flag.form.title"
                  values={{ spaceName }}
                  components={{ em: <em /> }}
                />
              </div>
              <p className={styles.sub}>{t("safety:flag.form.lead")}</p>

              <div className={styles.label}>
                {t("safety:flag.form.concernLabel")}
              </div>
              <div className={styles.opts}>
                {reasons.map((r) => (
                  <label
                    key={r.code}
                    className={[
                      styles.opt,
                      reason === r.code && styles.optChecked,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="radio"
                      name="flag-reason"
                      value={r.code}
                      checked={reason === r.code}
                      onChange={() => setReason(r.code)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>

              <div className={styles.label}>
                {t("safety:flag.form.detailLabel")}
              </div>
              <textarea
                className={styles.textarea}
                placeholder={t("safety:flag.form.detailPlaceholder")}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
              <div className={styles.counter}>
                {charsLeft > 0
                  ? t("safety:flag.form.charsRemaining", { count: charsLeft })
                  : t("safety:flag.form.charsCount", {
                      count: detail.trim().length,
                    })}
              </div>

              <div className={styles.note}>
                <svg viewBox="0 0 24 24">
                  <rect x={3} y={11} width={18} height={11} rx={2} />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <Translation
                  i18nKey="safety:flag.form.confidentialNote"
                  components={{ strong: <strong /> }}
                />
              </div>

              <div className={styles.actions}>
                <Button variant="ghost" onClick={onClose}>
                  {t("safety:flag.form.cancelCta")}
                </Button>
                <Button
                  variant="primary"
                  className={styles.full}
                  onClick={submit}
                  disabled={!canSubmit || createReport.isPending}
                >
                  {createReport.isPending
                    ? t("safety:flag.form.submitting")
                    : t("safety:flag.form.submitCta")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
