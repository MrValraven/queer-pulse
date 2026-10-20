import { useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { ApiError } from "../../shared/api/client";
import {
  Button,
  Collapse,
  ConfirmDialog,
  FormField,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ModReport } from "./adminModeration.data";
import {
  useDeleteReportedQuizshowGame,
  useEndReportedQuizshowGame,
} from "./api/useAdminQuizshow";
import styles from "./AdminModerationPage.module.css";
import studioStyles from "./AdminStudio.module.css";

type GameOutcome = "none" | "ended" | "deleted" | "gone" | "failed";

const OUTCOME_KEYS: Record<Exclude<GameOutcome, "none">, string> = {
  ended: "admin:moderation.quizshowGame.ended",
  deleted: "admin:moderation.quizshowGame.deleted",
  gone: "admin:moderation.quizshowGame.gone",
  failed: "admin:moderation.quizshowGame.error",
};

/** The backend's cap on a staff reason (QUIZSHOW_STAFF_REASON_MAX). */
const STAFF_REASON_MAX = 500;

/** The reason both confirms ask for; it goes to the moderation log with this report. */
function StaffReasonField({
  value,
  onChange,
  isRequiredShown,
}: {
  value: string;
  onChange: (value: string) => void;
  isRequiredShown: boolean;
}) {
  const { t } = useTranslation();
  return (
    <FormField
      label={t("admin:moderation.quizshowGame.reasonLabel")}
      required
      helper={t("admin:moderation.quizshowGame.reasonHint")}
      error={
        isRequiredShown
          ? t("admin:moderation.quizshowGame.reasonRequired")
          : undefined
      }
    >
      <textarea
        value={value}
        rows={3}
        maxLength={STAFF_REASON_MAX}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}

/** A reported Pulse Live game (subject id = the session id): "End this game"
 *  and "Delete this game", each behind a confirm that needs a reason. A 404
 *  reads as a game that is already gone, and the actions fold away once it is
 *  gone or deleted. */
export function AdminQuizshowGameActions({ report }: { report: ModReport }) {
  const { t } = useTranslation();
  const endGame = useEndReportedQuizshowGame();
  const deleteGame = useDeleteReportedQuizshowGame();
  const [openDialog, setOpenDialog] = useState<"none" | "end" | "delete">(
    "none",
  );
  const [outcome, setOutcome] = useState<GameOutcome>("none");
  const [reason, setReason] = useState("");
  const [isReasonRequiredShown, setIsReasonRequiredShown] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const isGameGone = outcome === "deleted" || outcome === "gone";
  const trimmedReason = reason.trim();

  const openConfirm = (dialog: "end" | "delete") => {
    setReason("");
    setIsReasonRequiredShown(false);
    setOpenDialog(dialog);
  };
  const changeReason = (nextReason: string) => {
    setReason(nextReason);
    if (nextReason.trim() !== "") setIsReasonRequiredShown(false);
  };
  /** The staff body, or null while the reason is blank (the line under the field then says so). */
  const staffInputOrNull = () => {
    if (trimmedReason === "") {
      setIsReasonRequiredShown(true);
      return null;
    }
    return {
      sessionId: report.subjectId,
      reason: trimmedReason,
      reportId: report.id,
    };
  };
  const reasonField = (
    <StaffReasonField
      value={reason}
      onChange={changeReason}
      isRequiredShown={isReasonRequiredShown}
    />
  );

  const settle = (nextOutcome: GameOutcome) => {
    setOpenDialog("none");
    setOutcome(nextOutcome);
    requestAnimationFrame(() => statusRef.current?.focus());
  };
  const handleError = (error: unknown) =>
    settle(
      error instanceof ApiError && error.status === 404 ? "gone" : "failed",
    );

  return (
    <section className={styles.dSec}>
      <span className={styles.dSecLabel}>
        {t("admin:moderation.quizshowGame.heading")}
      </span>
      <p className={studioStyles.panelNote}>
        {t("admin:moderation.quizshowGame.body")}
      </p>
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={`${studioStyles.status} ${studioStyles.panelNote}`}
      >
        {outcome === "none" ? "" : t(OUTCOME_KEYS[outcome])}
      </p>
      <Collapse isOpen={!isGameGone}>
        <div className={`${styles.dHeadChips} ${studioStyles.panelActions}`}>
          <Button variant="ghost" size="sm" onClick={() => openConfirm("end")}>
            {t("admin:moderation.quizshowGame.end")}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => openConfirm("delete")}
          >
            {t("admin:moderation.quizshowGame.delete")}
          </Button>
        </div>
      </Collapse>
      <AnimatePresence>
        {openDialog === "end" && (
          <ConfirmDialog
            key="end-game"
            open
            onClose={() => setOpenDialog("none")}
            onConfirm={() => {
              const input = staffInputOrNull();
              if (input === null) return;
              endGame.mutate(input, {
                onSuccess: () => settle("ended"),
                onError: handleError,
              });
            }}
            loading={endGame.isPending}
            tone="destructive"
            title={t("admin:moderation.quizshowGame.endTitle")}
            description={t("admin:moderation.quizshowGame.endBody")}
            confirmLabel={t("admin:moderation.quizshowGame.end")}
          >
            {reasonField}
          </ConfirmDialog>
        )}
        {openDialog === "delete" && (
          <ConfirmDialog
            key="delete-game"
            open
            onClose={() => setOpenDialog("none")}
            onConfirm={() => {
              const input = staffInputOrNull();
              if (input === null) return;
              deleteGame.mutate(input, {
                onSuccess: () => settle("deleted"),
                onError: handleError,
              });
            }}
            loading={deleteGame.isPending}
            tone="destructive"
            title={t("admin:moderation.quizshowGame.deleteTitle")}
            description={t("admin:moderation.quizshowGame.deleteBody")}
            confirmLabel={t("admin:moderation.quizshowGame.delete")}
          >
            {reasonField}
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </section>
  );
}
