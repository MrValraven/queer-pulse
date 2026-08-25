import type { ReactNode } from "react";
import { FiAlertTriangle, FiFlag } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { REASON_LABEL_KEYS } from "../safety/reportReasons";
import type { LivingCommunity } from "./community.model";
import { ModJoinRequestRow } from "./ModJoinRequestRow";
import type { JoinRequestDecision } from "./joinRequestReview.data";
import type { PulsePaging } from "./api/useCommunityPosts";
import { ModMemberRow, type ModMemberRowActions } from "./ModMemberRow";
import type { AssignableRole } from "./api/communities.api";
import type { CommunityRole } from "./membership.types";
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
      <div className={detail.secLbl}>
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
  roleOverrides,
  viewerRole,
  paging,
  ...actions
}: {
  members: RosterMember[];
  memberKey: (slug?: string, name?: string) => string;
  /** Optimistic roles for changes made this session, keyed by `memberKey`.
   *  The roster refetch behind each write is the eventual truth; this is what
   *  the row shows until it lands. */
  roleOverrides: Record<string, AssignableRole>;
  /** The signed-in moderator's own role — the row only offers what this
   *  viewer may actually do (co-owner in either direction is owner-only). */
  viewerRole: CommunityRole | null;
  /** The roster's own pagination. Mod tools read the SAME loaded pages the
   *  Members tab does, so without a load-more here a mod simply could not
   *  reach anyone past page one to promote, demote or remove them (and the
   *  owner could not transfer to them either). */
  paging: RosterPaging;
} & ModMemberRowActions) {
  const { t } = useTranslation();
  return (
    <>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.members.label")}{" "}
        <span className={detail.tabCount}>{members.length}</span>
      </div>
      {viewerRole === "owner" && (
        <p className={styles.modSectionNote}>
          {t("communities:detail.modtools.members.coOwnerNote")}
        </p>
      )}
      {members.map((m) => {
        const key = memberKey(m.slug, m.name);
        return (
          <ModMemberRow
            key={key}
            member={m}
            role={roleOverrides[key] ?? m.role}
            viewerRole={viewerRole}
            actions={actions}
          />
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
