import { useState } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminMagazineSubmissionDTO } from "./api/adminMagazineSubmissions.api";
import { useReopenMagazineSubmission } from "./api/useReopenMagazineSubmission";
import styles from "./AdminSubmissionList.module.css";

/**
 * The one route back from a decline on a reader story.
 *
 * A decline used to be permanent: the backend refuses a second decision, so a
 * wrong button, a change of mind after reading it properly, or a revision the
 * member sent afterwards ended the story with nothing anyone could do. This
 * puts it in the queue again.
 *
 * Offered only on a DECLINED row (the caller gates on that, and it returns null
 * as a guard). Accepted and commissioned rows never get it: both left a record
 * on the desk that reopening would strand, and the backend answers those with a
 * 409 too.
 *
 * Deliberate rather than prominent, on purpose. It is a correction, so it sits
 * last, in the ghost variant, behind the shared `ConfirmDialog` for its focus
 * trap and Escape handling. The dialog says what is actually lost, because
 * reopening erases the decline and the reply the member was sent, and it says
 * the member is told, because they are.
 */
export function AdminMagazineSubmissionReopenAction({
  submission,
}: {
  submission: AdminMagazineSubmissionDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reopen, pending } = useReopenMagazineSubmission();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (submission.decision !== "declined") return null;

  const submitterName =
    submission.submitter?.name ??
    t("admin:adminMagazineSubmissions.unknownMember");

  const handleConfirm = () =>
    reopen(submission.id, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        showToast(
          t("admin:adminMagazineSubmissions.reopen.doneToast", {
            title: submission.workingTitle,
          }),
          "success",
        );
      },
      onError: () => {
        setIsConfirmOpen(false);
        showToast(
          t("admin:adminMagazineSubmissions.reopen.failedToast"),
          "error",
        );
      },
    });

  return (
    <div className={styles.rowActions}>
      <div className={styles.rowActionButtons}>
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => setIsConfirmOpen(true)}
        >
          <FiRotateCcw aria-hidden />{" "}
          {t("admin:adminMagazineSubmissions.reopen.cta")}
        </Button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={pending}
        title={t("admin:adminMagazineSubmissions.reopen.confirmTitle", {
          title: submission.workingTitle,
        })}
        confirmLabel={t("admin:adminMagazineSubmissions.reopen.confirmCta")}
      >
        <p>
          {t("admin:adminMagazineSubmissions.reopen.confirmBody", {
            name: submitterName,
          })}
        </p>
      </ConfirmDialog>
    </div>
  );
}
