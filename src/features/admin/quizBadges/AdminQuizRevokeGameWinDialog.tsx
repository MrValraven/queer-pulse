import { useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  FormField,
  Modal,
} from "../../../shared/components/ui";
import {
  QUIZ_REVOKE_REASON_MAX_LENGTH,
  type QuizGameWinnerDTO,
} from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizWinBadgeErrorText } from "../../quizshow/winBadges/quizWinBadgeErrors";
import { quizBadgeCodePointLength } from "../../quizshow/winBadges/quizWinBadgeText";
import { useRevokeQuizGameWin } from "./api/useQuizEventBadges";
import styles from "./AdminQuizEventBadges.module.css";

interface AdminQuizRevokeGameWinDialogProps {
  eventId: string;
  winner: QuizGameWinnerDTO;
  onClose: () => void;
  /** Runs once the revoke succeeds, before the dialog closes, so the page can
   *  move focus off the Revoke win button that folds away. */
  onRevoked?: () => void;
}

/** The refusal text stays put while its row folds away, so it never blanks mid-fold. */
interface DialogRefusal {
  text: string;
  isShown: boolean;
}

/**
 * Revokes one member's win of one game, with a required reason. Every badge
 * the game gave them goes, and badges attached to the game later skip them.
 * A refusal names its reason inside the dialog. The dialog opens on the
 * reason, and Cancel, Escape and the close button wait for a revoke in flight.
 */
export function AdminQuizRevokeGameWinDialog({
  eventId,
  winner,
  onClose,
  onRevoked,
}: AdminQuizRevokeGameWinDialogProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const revokeWin = useRevokeQuizGameWin(eventId);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const [reason, setReason] = useState("");
  const [refusal, setRefusal] = useState<DialogRefusal>({
    text: "",
    isShown: false,
  });
  // The server trims the reason, so the counter and the limit read it trimmed.
  const trimmedReason = reason.trim();
  const reasonLength = quizBadgeCodePointLength(trimmedReason);
  const isReasonBlank = trimmedReason === "";
  const isReasonTooLong = reasonLength > QUIZ_REVOKE_REASON_MAX_LENGTH;
  const isConfirmDisabled =
    isReasonBlank || isReasonTooLong || revokeWin.isPending;
  // The revoke's refusal or its success toast always has its dialog to land in.
  const close = () => {
    if (!revokeWin.isPending) onClose();
  };

  const confirm = async () => {
    if (isConfirmDisabled) return;
    setRefusal((previous) => ({ ...previous, isShown: false }));
    try {
      await revokeWin.mutateAsync({
        winnerId: winner.winnerId,
        reason: trimmedReason,
      });
    } catch (error) {
      setRefusal({ text: quizWinBadgeErrorText(error, t, fmt), isShown: true });
      return;
    }
    showToast(t("quizshow:winBadges.admin.revoke.done"), "success");
    onRevoked?.();
    onClose();
  };

  return (
    <Modal
      initialFocusRef={reasonRef}
      title={t("quizshow:winBadges.admin.revoke.title")}
      onClose={close}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={close}
            disabled={revokeWin.isPending}
          >
            {t("quizshow:winBadges.admin.revoke.cancel")}
          </Button>
          <Button
            variant="danger"
            disabled={isConfirmDisabled}
            aria-busy={revokeWin.isPending || undefined}
            onClick={() => void confirm()}
          >
            {t("quizshow:winBadges.admin.revoke.confirm")}
          </Button>
        </>
      }
    >
      <div className={styles.dialogBody}>
        <p className={styles.dialogLine}>
          {t("quizshow:winBadges.admin.revoke.body", {
            name: winner.screenName,
          })}
        </p>
        <p className={styles.dialogLine}>
          {t("quizshow:winBadges.admin.revoke.final")}
        </p>
        <FormField
          label={t("quizshow:winBadges.admin.revoke.reason")}
          required
          labelAside={t("quizshow:winBadges.admin.form.counter", {
            count: reasonLength,
            max: QUIZ_REVOKE_REASON_MAX_LENGTH,
          })}
          error={
            isReasonTooLong
              ? t("quizshow:winBadges.errors.quiz_badge_revoke_reason_too_long")
              : undefined
          }
        >
          <textarea
            ref={reasonRef}
            className={styles.reason}
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </FormField>
        <Collapse isOpen={refusal.isShown}>
          <p className={styles.refusal} role="alert">
            <FiAlertCircle
              aria-hidden
              fill="none"
              className={styles.refusalIcon}
            />
            {refusal.text}
          </p>
        </Collapse>
      </div>
    </Modal>
  );
}
