import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import { joinRequestReviewer } from "./joinRequestReviewer";
import { useJoinRequestShortDate } from "./joinRequestShortDate";
import rowStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminVerifyDecided.module.css";

/**
 * The decided row's dates line: when they applied, when it was decided, and by
 * whom. The reviewer is named inline only when there is a name to give (your
 * own call reads as "you"). A reviewer the server could not name, or a row with
 * no reviewer at all, keeps the plain "Decided {date}" so a raw id never lands
 * in a sentence. The summary button lists this line in its aria-describedby,
 * so the name is announced with the row.
 */
export function JoinRequestDecidedDates({
  id,
  item,
  currentUserId,
}: {
  /** Referenced by the summary button's aria-describedby. */
  id: string;
  item: JoinRequestView;
  /** The signed-in reviewer, or null while the session is still loading. */
  currentUserId: string | null;
}) {
  const { t } = useTranslation();
  const shortDate = useJoinRequestShortDate();
  const appliedOn = shortDate(item.createdAt);
  const decidedOn = shortDate(item.reviewedAt);

  const reviewer = joinRequestReviewer(item, currentUserId);
  const reviewerName =
    reviewer.kind === "self"
      ? t("admin:members.verify.decided.reviewerYou")
      : reviewer.kind === "named"
        ? reviewer.name
        : null;

  const appliedLine = appliedOn
    ? t("admin:members.verify.decided.appliedOn", { date: appliedOn })
    : t("admin:members.verify.appliedRecently");
  const decidedLine = decidedOn
    ? reviewerName
      ? t("admin:members.verify.decided.decidedOnBy", {
          date: decidedOn,
          name: reviewerName,
        })
      : t("admin:members.verify.decided.decidedOn", { date: decidedOn })
    : reviewerName
      ? t("admin:members.verify.decided.decidedUnknownBy", {
          name: reviewerName,
        })
      : t("admin:members.verify.decided.decidedUnknown");

  return (
    <span id={id} className={`${rowStyles.rowDates} ${styles.summaryLine}`}>
      {`${appliedLine} · ${decidedLine}`}
    </span>
  );
}
