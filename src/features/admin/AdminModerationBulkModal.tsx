import { useId, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal, AdminSeg, type AdminSegOption } from "./ui";
import { MOD_REASONS } from "./adminModeration.data";
import {
  MIN_MEMBER_FACING_NOTE_LENGTH,
  isMemberFacingModAction,
} from "./reportDrawerOptions";
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
 *
 * PRD-287: the note floor is the SAME rule the single-report drawer runs, read
 * from the one place it is written down (`reportDrawerOptions.ts`), because the
 * backend holds `ModBulkActionDto` to exactly what it holds `ModActionDto` to.
 * It bites harder here. A batch refused for a short note takes every decision
 * in it down at once, and the 400 does not say which row was the problem, so a
 * moderator who selected fifteen reports loses all fifteen and has to guess.
 * The four actions that can open this modal (`remove_content`, `warn`,
 * `suspend`, `ban`) are all member-facing, so in practice the floor always
 * applies; the predicate is still asked, because `action` is typed as the full
 * `ModActionCode` union and a `dismiss` arriving here later must not silently
 * inherit a rule the server does not apply to it. Every action keeps the
 * non-empty floor this modal already had.
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
  const confirmBlockedNoticeId = useId();

  const needsDuration = action === "suspend";
  const trimmedNoteLength = note.trim().length;
  const isMemberFacingAction = isMemberFacingModAction(action);
  const isNoteTooShort =
    trimmedNoteLength <
    (isMemberFacingAction ? MIN_MEMBER_FACING_NOTE_LENGTH : 1);
  const canConfirm = reasonCode !== null && !isNoteTooShort;

  const confirm = () => {
    if (!canConfirm) return;
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
          <Button
            variant="primary"
            disabled={!canConfirm}
            onClick={confirm}
            aria-describedby={canConfirm ? undefined : confirmBlockedNoticeId}
          >
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

      {/* Why Apply is unavailable, beside the field it is asking for. The same
          explanation the single-report drawer gives, for the same rule, with
          the live character count: a greyed button that says nothing is how a
          moderator ends up believing the batch is broken. */}
      {!canConfirm && (
        <p className={styles.dTransparency} id={confirmBlockedNoticeId}>
          <FiAlertCircle aria-hidden />{" "}
          {reasonCode === null
            ? t("admin:moderation.bulk.confirm.pickReasonNotice")
            : t("admin:moderation.bulk.confirm.noteRequiredNotice", {
                count,
                min: isMemberFacingAction ? MIN_MEMBER_FACING_NOTE_LENGTH : 1,
                current: trimmedNoteLength,
              })}
        </p>
      )}
    </AdminModal>
  );
}
