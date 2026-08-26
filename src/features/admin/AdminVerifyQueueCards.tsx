import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BanEvasionAssessmentDTO } from "./api/adminInvites.api";
import type { JoinRequestView } from "./api/useJoinRequests";
import { JoinRequestApprovedCard } from "./JoinRequestApprovedCard";
import { JoinRequestCard } from "./JoinRequestCard";
import styles from "./AdminMembersPage.module.css";
import busyStyles from "./AdminVerifyQueueCards.module.css";

/**
 * The card lists of the join-request review queue, split out of
 * `AdminVerifyQueue` so that component stays layout-light and under the
 * per-component line limit. All decision state lives in the parent; these are
 * presentational.
 *
 * `decidingId` is the row whose approve/waitlist PATCH is still in flight. That
 * card dims and stops taking pointer input until the server answers, so a
 * reviewer cannot fire a second, contradicting decision on the same applicant.
 */

/** The placeholder cards the queue shows while the first page loads. */
export function AdminVerifyQueueSkeleton() {
  return (
    <div className={styles.queueGrid}>
      {[0, 1, 2].map((index) => (
        <div className={styles.queueCard} key={index}>
          <SkeletonLine width="55%" height={18} />
          <SkeletonLine width="80%" />
          <SkeletonLine width="90%" height={40} />
        </div>
      ))}
    </div>
  );
}

export function AdminVerifyQueueCards({
  approved,
  queue,
  leavingIds,
  decidingId,
  selectedIds,
  onApprove,
  onDecline,
  onWaitlist,
  onToggleSelect,
  banEvasionBySubjectId,
  currentUserId,
  isAssignmentBusy,
  onClaim,
  onRelease,
}: {
  /** Rows already welcomed in this session, held on screen for the invite link. */
  approved: JoinRequestView[];
  /** The pending rows still awaiting a decision. */
  queue: JoinRequestView[];
  leavingIds: Set<string>;
  decidingId: string | null;
  selectedIds: Set<string>;
  onApprove: (item: JoinRequestView) => void;
  onDecline: (item: JoinRequestView) => void;
  onWaitlist: (item: JoinRequestView) => void;
  onToggleSelect: (id: string) => void;
  /** Ban-evasion assessments for the whole page, keyed by join-request id.
   *  Advisory signals for the reviewer; empty for every applicant with
   *  nothing to check. */
  banEvasionBySubjectId: Map<string, BanEvasionAssessmentDTO>;
  /** OPS-04. The signed-in reviewer, so a card can tell "you have this" from
   *  "a colleague has this". Null while the session is still loading. */
  currentUserId: string | null;
  /** True while any claim/release in this queue is in flight. */
  isAssignmentBusy: boolean;
  onClaim: (item: JoinRequestView) => void;
  onRelease: (item: JoinRequestView) => void;
}) {
  return (
    <div className={styles.queueGrid}>
      {approved.map((item) => (
        <FadeIn key={item.id}>
          <JoinRequestApprovedCard item={item} />
        </FadeIn>
      ))}
      {queue.map((item, index) => {
        const isDeciding = decidingId === item.id;
        return (
          <FadeIn
            key={item.id}
            delay={index * 60}
            className={isDeciding ? busyStyles.deciding : undefined}
            aria-busy={isDeciding || undefined}
          >
            <JoinRequestCard
              item={item}
              leaving={leavingIds.has(item.id)}
              stage="pending"
              selected={selectedIds.has(item.id)}
              onApprove={() => onApprove(item)}
              onDecline={() => onDecline(item)}
              onWaitlist={() => onWaitlist(item)}
              onToggleSelect={onToggleSelect}
              isBusy={isDeciding}
              banEvasion={banEvasionBySubjectId.get(item.id)}
              currentUserId={currentUserId}
              isAssignmentBusy={isAssignmentBusy}
              onClaim={() => onClaim(item)}
              onRelease={() => onRelease(item)}
            />
          </FadeIn>
        );
      })}
    </div>
  );
}

export function AdminVerifyQueueWaitlist({
  items,
  decidingId,
  onApprove,
  onDecline,
  banEvasionBySubjectId,
  currentUserId,
  isAssignmentBusy,
  onClaim,
  onRelease,
}: {
  items: JoinRequestView[];
  decidingId: string | null;
  onApprove: (item: JoinRequestView) => void;
  onDecline: (item: JoinRequestView) => void;
  banEvasionBySubjectId: Map<string, BanEvasionAssessmentDTO>;
  /** OPS-04. The signed-in reviewer, so a card can tell "you have this" from
   *  "a colleague has this". Null while the session is still loading. */
  currentUserId: string | null;
  /** True while any claim/release in this queue is in flight. */
  isAssignmentBusy: boolean;
  onClaim: (item: JoinRequestView) => void;
  onRelease: (item: JoinRequestView) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.queueWaitlistSection}>
      <h3 className={styles.dHeading}>
        {t("admin:members.verify.waitlistedSectionTitle")}
      </h3>
      <div className={styles.queueGrid}>
        {items.map((item, index) => {
          const isDeciding = decidingId === item.id;
          return (
            <FadeIn
              key={item.id}
              delay={index * 60}
              className={isDeciding ? busyStyles.deciding : undefined}
              aria-busy={isDeciding || undefined}
            >
              <JoinRequestCard
                item={item}
                leaving={false}
                stage="waitlisted"
                selected={false}
                onApprove={() => onApprove(item)}
                onDecline={() => onDecline(item)}
                onToggleSelect={() => {}}
                isBusy={isDeciding}
                banEvasion={banEvasionBySubjectId.get(item.id)}
                currentUserId={currentUserId}
                isAssignmentBusy={isAssignmentBusy}
                onClaim={() => onClaim(item)}
                onRelease={() => onRelease(item)}
              />
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
