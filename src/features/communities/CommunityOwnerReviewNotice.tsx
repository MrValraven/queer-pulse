import type { ReactNode } from "react";
import { FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { CommunityOwnerReviewRequestDTO } from "./api/communityOwnerReview.api";
import styles from "./CommunityDangerZone.module.css";

/**
 * The open owner-review request, as the community's staff and its owner both
 * see it: who filed it, when, and what they wrote.
 *
 * The owner gets an extra line, because for them this is the one surface where
 * being present is the answer. Everything here reports observed facts (dates,
 * contact attempts, the filer's own words) and says nothing about the owner
 * themselves.
 */
export function CommunityOwnerReviewNotice({
  request,
  isOwner,
  action,
}: {
  request: CommunityOwnerReviewRequestDTO;
  isOwner: boolean;
  /** The withdraw control, when this viewer is allowed to withdraw. */
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const filerName = request.requestedBy
    ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}`.trim()
    : "";

  return (
    <div className={styles.notice}>
      <div className={styles.noticeHead}>
        <FiEyeOff aria-hidden />{" "}
        {isOwner
          ? t("communities:detail.dangerZone.ownerReview.open.ownerHeading")
          : t("communities:detail.dangerZone.ownerReview.open.staffHeading")}
      </div>
      {isOwner && (
        <p className={styles.rowText}>
          {t("communities:detail.dangerZone.ownerReview.open.ownerBody")}
        </p>
      )}
      <p className={styles.rowText}>
        {filerName
          ? t("communities:detail.dangerZone.ownerReview.open.filedBy", {
              name: filerName,
              date: fmt.date(new Date(request.createdAt)),
            })
          : t("communities:detail.dangerZone.ownerReview.open.filedOn", {
              date: fmt.date(new Date(request.createdAt)),
            })}
      </p>
      <p className={styles.rowText}>
        {request.reason
          ? t("communities:detail.dangerZone.ownerReview.open.reason", {
              reason: request.reason,
            })
          : t("communities:detail.dangerZone.ownerReview.open.noReason")}
      </p>
      {action}
    </div>
  );
}

/**
 * The community carries the platform's own ownership-check flag with no
 * moderator request behind it (the automatic orphan path sets this when an
 * owner erases their account and there is nobody to promote). A different
 * state from an open request, so it says a different thing.
 */
export function CommunityOwnerReviewFlagNotice() {
  const { t } = useTranslation();
  return (
    <div className={styles.notice}>
      <div className={styles.noticeHead}>
        <FiEyeOff aria-hidden />{" "}
        {t("communities:detail.dangerZone.ownerReview.flagged.heading")}
      </div>
      <p className={styles.rowText}>
        {t("communities:detail.dangerZone.ownerReview.flagged.body")}
      </p>
    </div>
  );
}
