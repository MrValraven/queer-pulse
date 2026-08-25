import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal, AdminSeg, type AdminSegOption } from "./ui";
import { MOD_REASONS } from "./adminModeration.data";
import type { ModActionCode } from "./api/moderation.api";
import styles from "./AdminModerationPage.module.css";

const BULK_SUSPEND_DURATIONS = ["24h", "7d", "30d"] as const;

/** The actions this modal confirms, and the copy key for each one's title. */
const TITLE_KEY: Partial<Record<ModActionCode, string>> = {
  remove_content: "admin:moderation.bulk.confirm.title.removeContent",
  warn: "admin:moderation.bulk.confirm.title.warn",
  suspend: "admin:moderation.bulk.confirm.title.suspend",
  ban: "admin:moderation.bulk.confirm.title.ban",
};

export interface BulkActionDecision {
  reasonCode: string;
  note: string;
  duration?: string;
}

/**
 * Confirms a bulk moderation action with the same rigour the single-report
 * drawer already demands: a reason code and the exact member-facing note.
 * Ban / warn / remove-content used to fire straight off a click with
 * `reasonCode: "other"` and an empty note, so the member's `mod_action`
 * notification carried nothing to appeal against, and a mis-click on Ban with
 * fifteen rows selected was recoverable only inside the 5.6s undo window.
 *
 * A suspend also collects a duration, which the backend requires.
 */
export function BulkActionModal({
  count,
  action,
  onClose,
  onConfirm,
}: {
  count: number;
  action: ModActionCode;
  onClose: () => void;
  onConfirm: (decision: BulkActionDecision) => void;
}) {
  const { t } = useTranslation();
  const [reasonCode, setReasonCode] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState<string>("7d");

  const needsDuration = action === "suspend";
  const canConfirm = reasonCode !== null && note.trim().length > 0;

  const confirm = () => {
    if (reasonCode === null || note.trim().length === 0) return;
    onConfirm({
      reasonCode,
      note: note.trim(),
      duration: needsDuration ? duration : undefined,
    });
  };

  const durationOptions = BULK_SUSPEND_DURATIONS.map((id) => ({
    value: id,
    label: t(`admin:moderation.reportDrawer.restrictDuration.${id}`),
  })) satisfies AdminSegOption[];

  return (
    <AdminModal
      title={t(TITLE_KEY[action] ?? "admin:moderation.bulk.confirm.title.ban", {
        count,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="primary" disabled={!canConfirm} onClick={confirm}>
            {t("admin:moderation.bulk.confirm.applyCta", { count })}
          </Button>
        </>
      }
    >
      <p className={styles.dTransparency}>
        {t("admin:moderation.bulk.confirm.body", { count })}
      </p>

      {needsDuration && (
        <>
          <h3 className={styles.dSecLabel}>
            {t("admin:moderation.bulk.confirm.durationLabel")}
          </h3>
          <AdminSeg
            options={durationOptions}
            value={duration}
            onChange={setDuration}
          />
        </>
      )}

      <h3 className={styles.dSecLabel}>
        {t("admin:moderation.reportDrawer.reasonTitle")}
      </h3>
      <div
        className={styles.dReasons}
        role="radiogroup"
        aria-label={t("admin:moderation.reportDrawer.reasonAriaLabel")}
      >
        {MOD_REASONS.map((reason) => (
          <label key={reason.id} className={styles.dReason}>
            <input
              type="radio"
              name="bulk-mod-reason"
              value={reason.id}
              checked={reasonCode === reason.id}
              onChange={() => setReasonCode(reason.id)}
            />
            <span>{t(reason.labelKey)}</span>
          </label>
        ))}
      </div>

      <textarea
        aria-label={t("admin:moderation.reportDrawer.noteAriaLabel")}
        className={styles.dNote}
        rows={3}
        placeholder={t("admin:moderation.bulk.confirm.notePlaceholder")}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />
      <p className={styles.dTransparency}>
        {t("admin:moderation.bulk.confirm.transparency", { count })}
      </p>
    </AdminModal>
  );
}
