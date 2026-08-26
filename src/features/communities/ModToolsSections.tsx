import type { ReactNode } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModerationStanceNote } from "../safety/ModerationStanceNote";
import type { LivingCommunity } from "./community.model";
import { ModJoinRequestRow } from "./ModJoinRequestRow";
import { ModToolsReportRow } from "./ModToolsReportRow";
import type { JoinRequestDecision } from "./joinRequestReview.data";
import type { PulsePaging } from "./api/useCommunityPosts";
import { ModMemberRow, type ModMemberRowActions } from "./ModMemberRow";
import type { AssignableRole } from "./api/communities.api";
import type { CommunityRole } from "./membership.types";
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
      <ModerationStanceNote variant="applicants" />
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
  slug,
  state,
  onRemove,
  onDismiss,
  onEscalate,
}: {
  reports: Report[];
  /** The community this queue belongs to: each row links into its thread. */
  slug: string;
  state: ModQueueState;
  onRemove: (report: Report) => void;
  onDismiss: (report: Report) => void;
  /** Hands a report to platform staff (TS-07). */
  onEscalate: (report: Report) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.reports.label")}{" "}
        {reports.length > 0 && (
          <span className={detail.tabCount}>{reports.length}</span>
        )}
      </div>
      <ModerationStanceNote />
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
          reports.map((report) => (
            // "Remove" now works for a reply as well as a post (TS-08): the
            // takedown goes through the report itself rather than through the
            // community delete-post endpoint, and the server keys it on the
            // report's own subject type.
            <ModToolsReportRow
              key={report.id}
              report={report}
              slug={slug}
              onRemove={onRemove}
              onDismiss={onDismiss}
              onEscalate={onEscalate}
            />
          ))
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
