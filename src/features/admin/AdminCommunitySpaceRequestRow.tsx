import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { AccessTierBadge } from "../communities/CommunityBadges";
import { AdminAvatar, AdminChip, type AdminTone } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import { communityPath } from "../../app/routeMap";
import type { AdminCommunitySpaceRequestDTO } from "./api/adminCommunitySpaceRequests.api";
import styles from "./AdminSubmissionList.module.css";

const STATUS_TONE: Record<AdminCommunitySpaceRequestDTO["status"], AdminTone> =
  {
    open: "amber",
    approved: "jade",
    declined: "danger",
    withdrawn: "ghost",
  };

/**
 * One "Request spaces" row on the admin review queue. Mirrors
 * `AdminCommunityTagRequestsPage`'s `TagRequestRow`. `requestedBy` is ABSENT
 * (not null) for a reader holding only the `communities` grant, which reads
 * differently from a requester whose account is gone (`null`).
 */
export function AdminCommunitySpaceRequestRow({
  request,
  isPending,
  onApprove,
  onDecline,
}: {
  request: AdminCommunitySpaceRequestDTO;
  isPending: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isRequesterWithheld = !("requestedBy" in request);
  const requesterName = isRequesterWithheld
    ? t("admin:adminCommunitySpaceRequests.withheldRequester")
    : request.requestedBy
      ? request.requestedBy.name
      : t("admin:adminCommunitySpaceRequests.unknownRequester");

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          {request.community && (
            <AdminAvatar
              size="sm"
              src={request.community.avatarUrl ?? undefined}
              initials={request.community.name.slice(0, 1)}
              alt=""
            />
          )}
          {request.community && (
            <Link
              to={communityPath(request.community.slug)}
              className={`${styles.rowName} ${styles.rowNameLink}`}
            >
              {request.community.name}
            </Link>
          )}
          {request.community && (
            <AccessTierBadge tier={request.community.accessTier} />
          )}
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminCommunitySpaceRequests.row.by", {
            name: requesterName,
          })}
        </div>
        {request.note && <p className={styles.rowNote}>{request.note}</p>}
        {request.status === "declined" && request.declineReason && (
          <p className={styles.rowNote}>
            {t("admin:adminCommunitySpaceRequests.row.declineReason", {
              reason: request.declineReason,
            })}
          </p>
        )}
        <div className={styles.rowDates}>
          {t("admin:adminCommunitySpaceRequests.row.sent", {
            age: formatRelative(request.createdAt, fmt),
          })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <AdminChip tone={STATUS_TONE[request.status]} dot>
          {t(`admin:adminCommunitySpaceRequests.status.${request.status}`)}
        </AdminChip>
        {request.status === "open" && (
          <div className={styles.rowActionButtons}>
            <Button
              variant="jade"
              size="sm"
              disabled={isPending}
              onClick={onApprove}
            >
              {t("admin:adminCommunitySpaceRequests.action.approve")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={onDecline}
            >
              {t("admin:adminCommunitySpaceRequests.action.decline")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
