import { useTranslation } from "../../shared/i18n/useTranslation";
import { approvalReasonLabelKey } from "../auth/api/joinRequestApprovalReason";
import type { JoinRequestView } from "./api/useJoinRequests";
import rowStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminVerifyDecided.module.css";

/**
 * Why an approved request was let in, in the expanded decided row: the reason
 * the reviewer picked, then, for an "Other" call, the note they wrote saying
 * what the reason was. An approval from before reasons were asked for reads
 * "No reason recorded" in a quieter line instead.
 */
export function JoinRequestDecidedApprovalReason({
  item,
}: {
  item: JoinRequestView;
}) {
  const { t } = useTranslation();
  const approvalReasonKey = approvalReasonLabelKey(item.approvalReason);

  if (!approvalReasonKey) {
    return (
      <div className={`${rowStyles.rowNote} ${styles.reasonMissing}`}>
        {t("admin:members.verify.decided.approvalReasonMissing")}
      </div>
    );
  }

  return (
    <>
      <div className={rowStyles.rowNote}>
        {t("admin:members.verify.decided.approvalReasonLine", {
          reason: t(approvalReasonKey),
        })}
      </div>
      {item.approvalNote && (
        <div className={`${rowStyles.rowNote} ${styles.approvalNote}`}>
          {t("admin:members.verify.decided.approvalNoteLine", {
            note: item.approvalNote,
          })}
        </div>
      )}
    </>
  );
}
