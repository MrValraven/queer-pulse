import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiX,
  FiFlag,
  FiUserPlus,
  FiUserMinus,
  FiShield,
} from "react-icons/fi";
import {
  Avatar,
  Button,
  EmptyState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
import type { LivingCommunity } from "./community.model";
import { ModJoinRequestRow } from "./ModJoinRequestRow";
import type { JoinRequestDecision } from "./joinRequestReview.data";
import type { PulsePaging } from "./api/useCommunityPosts";
import { photoOf } from "./communityPeople";
import { RoleBadge } from "./CommunityBadges";
import { useCommunityTime } from "./communityTime";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

// The members-card entry point lives in its own file (`ModToolsCardSection`)
// rather than growing this already-364-line, multi-session-shared file — it
// pulls in the card designer + preview face, which belong with the `cards`
// feature, not here. Re-exported so `ModToolsTab` can import every mod-tools
// section from one place, same as the rest of this module.
export { ModToolsCardSection } from "./ModToolsCardSection";

type JoinRequest = NonNullable<LivingCommunity["joinRequests"]>[number];
type Report = NonNullable<LivingCommunity["reports"]>[number];
type RosterMember = LivingCommunity["roster"][number];
type RosterPaging = Pick<
  PulsePaging,
  "hasNextPage" | "fetchNextPage" | "isFetchingNextPage"
>;

/** Whether a mod queue is still loading or failed to load, plus its retry. */
export interface ModQueueState {
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

/** The two mod queues share one loading/failure treatment. An empty list is
 *  only ever shown once we know the queue really is empty — a 403 (the
 *  community-mod vs. platform-moderator gap) or a dropped request used to
 *  paint the "all clear" empty state instead. */
function ModQueueStatus({
  state,
  children,
}: {
  state: ModQueueState;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (state.isLoading) {
    return (
      <div aria-busy="true">
        <SkeletonLine height={14} style={{ marginBottom: 10 }} />
        <SkeletonLine height={14} width="70%" />
      </div>
    );
  }
  if (state.isError) {
    return (
      <EmptyState
        compact
        icon={<FiAlertTriangle />}
        title={t("communities:detail.modtools.queueError.title")}
        description={t("communities:detail.modtools.queueError.description")}
        action={{
          label: t("communities:detail.modtools.queueError.retry"),
          onClick: state.retry,
        }}
      />
    );
  }
  return <>{children}</>;
}

export function ModJoinRequests({
  requests,
  state,
  isPending = false,
  onResolve,
}: {
  requests: JoinRequest[];
  state: ModQueueState;
  /** True while a decision for this queue is in flight (keeps the decline
   *  step's confirm button from firing twice). */
  isPending?: boolean;
  onResolve: (id: string, name: string, decision: JoinRequestDecision) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.joinRequests.label")}{" "}
        {requests.length > 0 && (
          <span className={detail.tabCount}>{requests.length}</span>
        )}
      </div>
      <ModQueueStatus state={state}>
        {requests.length === 0 ? (
          <EmptyState
            compact
            title={t("communities:detail.modtools.joinRequests.empty.title")}
            description={t(
              "communities:detail.modtools.joinRequests.empty.description",
            )}
          />
        ) : (
          requests.map((request) => (
            <ModJoinRequestRow
              key={request.id}
              request={request}
              isPending={isPending}
              onResolve={onResolve}
            />
          ))
        )}
      </ModQueueStatus>
    </>
  );
}

export function ModReportedPosts({
  reports,
  state,
  onRemove,
  onDismiss,
}: {
  reports: Report[];
  state: ModQueueState;
  onRemove: (report: Report) => void;
  onDismiss: (report: Report) => void;
}) {
  const { t } = useTranslation();
  const communityTime = useCommunityTime();
  return (
    <>
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        {t("communities:detail.modtools.reports.label")}{" "}
        {reports.length > 0 && (
          <span className={detail.tabCount}>{reports.length}</span>
        )}
      </div>
      <ModQueueStatus state={state}>
        {reports.length === 0 ? (
          <EmptyState
            compact
            title={t("communities:detail.modtools.reports.empty.title")}
            description={t(
              "communities:detail.modtools.reports.empty.description",
            )}
          />
        ) : (
          reports.map((rep) => {
            // Demo mocks author a free-text `reason`; live rows only carry a
            // stable `reasonCode` (the leaner `GET /communities/:slug/reports`
            // shape), resolved to a label here.
            const reasonLabel =
              rep.reason ??
              (rep.reasonCode ? t(REASON_LABEL_KEYS[rep.reasonCode]) : "");
            // "Remove" deletes a post by id — this queue has no parent-post id
            // for a reply report, so that action only wires up for posts.
            const canRemove =
              rep.subjectType == null || rep.subjectType === "post";
            return (
              <div className={styles.reportCard} key={rep.id}>
                <div className={styles.reportReason}>
                  <FiFlag aria-hidden /> {reasonLabel}
                </div>
                {rep.postExcerpt && (
                  <p className={styles.reportExcerpt}>“{rep.postExcerpt}”</p>
                )}
                <div className={styles.modMeta}>
                  {rep.author && rep.reporter
                    ? t("communities:detail.modtools.reports.meta", {
                        author: rep.author.name,
                        reporter: rep.reporter.name,
                        time: communityTime.ago(rep),
                      })
                    : t("communities:detail.modtools.reports.metaLive", {
                        time: communityTime.ago(rep),
                      })}
                </div>
                {!canRemove && (
                  <p className={styles.modMeta}>
                    {t("communities:detail.modtools.reports.replyNote")}
                  </p>
                )}
                <div className={styles.modActions} style={{ marginTop: 12 }}>
                  {canRemove && (
                    <Button variant="primary" onClick={() => onRemove(rep)}>
                      {t("communities:detail.modtools.reports.removeCta")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.declineBtn}
                    onClick={() => onDismiss(rep)}
                  >
                    {t("communities:detail.modtools.reports.dismissCta")}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </ModQueueStatus>
    </>
  );
}

export function ModMemberManagement({
  members,
  memberKey,
  promoted,
  demoted,
  paging,
  onPromote,
  onDemote,
  onRemove,
}: {
  members: RosterMember[];
  memberKey: (slug?: string, name?: string) => string;
  promoted: string[];
  demoted: string[];
  /** The roster's own pagination. Mod tools read the SAME loaded pages the
   *  Members tab does, so without a load-more here a mod simply could not
   *  reach anyone past page one to promote, demote or remove them (and the
   *  owner could not transfer to them either). */
  paging: RosterPaging;
  onPromote: (slug: string | undefined, name: string) => void;
  onDemote: (slug: string | undefined, name: string) => void;
  onRemove: (slug: string | undefined, name: string) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <>
      <div className={detail.secLbl} style={{ marginTop: 32 }}>
        {t("communities:detail.modtools.members.label")}{" "}
        <span className={detail.tabCount}>{members.length}</span>
      </div>
      {members.map((m) => {
        const key = memberKey(m.slug, m.name);
        const isOwner = m.role === "owner";
        const isMod =
          !isOwner &&
          !demoted.includes(key) &&
          (m.role === "mod" || promoted.includes(key));
        return (
          <div className={styles.modRow} key={key}>
            <Avatar
              initials={m.initials}
              tint={m.tint}
              src={photoOf(m, demoMode)}
              size={38}
              alt={m.name}
            />
            <div className={styles.modMain}>
              <div className={styles.modName}>
                {m.name}{" "}
                <RoleBadge
                  role={isOwner ? "owner" : isMod ? "mod" : "member"}
                />
                <MemberStaffBadge slug={m.slug} />
              </div>
              {m.title && <div className={styles.modMeta}>{m.title}</div>}
            </div>
            <div className={styles.modActions}>
              {!isOwner && !isMod && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.declineBtn}
                  onClick={() => onPromote(m.slug, m.name)}
                >
                  <FiUserPlus aria-hidden />{" "}
                  {t("communities:detail.modtools.members.makeModCta")}
                </Button>
              )}
              {!isOwner && isMod && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.declineBtn}
                  onClick={() => onDemote(m.slug, m.name)}
                >
                  <FiUserMinus aria-hidden />{" "}
                  {t("communities:detail.modtools.members.demoteCta")}
                </Button>
              )}
              {!isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={[styles.declineBtn, styles.removeBtn].join(" ")}
                  onClick={() => onRemove(m.slug, m.name)}
                >
                  <FiX aria-hidden />{" "}
                  {t("communities:detail.modtools.members.removeCta")}
                </Button>
              )}
              {isOwner && (
                <span className={styles.ownerTag}>
                  <FiShield aria-hidden />{" "}
                  {t("communities:detail.modtools.members.ownerTag")}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {paging.hasNextPage && (
        <div className={styles.loadMoreRoster}>
          <Button
            variant="ghost"
            disabled={paging.isFetchingNextPage}
            onClick={paging.fetchNextPage}
          >
            {paging.isFetchingNextPage
              ? t("communities:common.loading")
              : t("communities:detail.roster.loadMoreCta")}
          </Button>
        </div>
      )}
    </>
  );
}
