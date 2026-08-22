import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { PulsePaging } from "./api/useCommunityPosts";

type RosterPaging = Pick<
  PulsePaging,
  "hasNextPage" | "fetchNextPage" | "isFetchingNextPage"
>;
import {
  ModJoinRequests,
  ModMemberManagement,
  ModReportedPosts,
  ModToolsCardSection,
} from "./ModToolsSections";
import { ModToolsInsights } from "./ModToolsInsights";
import { CommunityDangerZone } from "./CommunityDangerZone";
import { useModToolsActions } from "./useModToolsActions";

export function ModToolsTab({
  living,
  role,
  communityName,
  rosterPaging,
}: {
  living: LivingCommunity;
  role: CommunityRole | null;
  communityName: string;
  /** The roster's pagination, threaded straight through to the member-
   *  management list so a mod can reach members past the first page. */
  rosterPaging: RosterPaging;
}) {
  const { t } = useTranslation();
  const {
    requests,
    requestsState,
    reports,
    reportsState,
    manageable,
    memberKey,
    promoted,
    demoted,
    resolveRequest,
    promote,
    demote,
    dismissReportRow,
    confirming,
    setConfirming,
    confirmRemoveMember,
    confirmRemoveReport,
    isConfirmPending,
  } = useModToolsActions(living);

  const confirmCopy =
    confirming == null
      ? null
      : confirming.kind === "removeMember"
        ? {
            title: t("communities:detail.modtools.confirm.removeMember.title", {
              name: confirming.name,
            }),
            body: t("communities:detail.modtools.confirm.removeMember.body"),
            cta: t(
              "communities:detail.modtools.confirm.removeMember.confirmCta",
            ),
          }
        : {
            title: t("communities:detail.modtools.confirm.removePost.title"),
            body: t("communities:detail.modtools.confirm.removePost.body"),
            cta: t("communities:detail.modtools.confirm.removePost.confirmCta"),
          };

  return (
    <div>
      <ModToolsInsights slug={living.slug} />
      <ModJoinRequests
        requests={requests}
        state={requestsState}
        onResolve={resolveRequest}
      />
      <ModReportedPosts
        reports={reports}
        state={reportsState}
        onRemove={(report) => setConfirming({ kind: "removeReport", report })}
        onDismiss={dismissReportRow}
      />
      <ModMemberManagement
        members={manageable}
        memberKey={memberKey}
        promoted={promoted}
        demoted={demoted}
        paging={rosterPaging}
        onPromote={promote}
        onDemote={demote}
        onRemove={(memberSlug, name) =>
          setConfirming({ kind: "removeMember", memberSlug, name })
        }
      />
      <ModToolsCardSection
        slug={living.slug}
        communityName={communityName}
        role={role}
      />

      <CommunityDangerZone
        slug={living.slug}
        name={communityName}
        role={role}
        roster={manageable}
      />

      {/* Removing a member and taking a post down are both irreversible from
          here, so each is confirmed first — the same rule the danger zone
          below already follows. */}
      {confirming && confirmCopy && (
        <ConfirmDialog
          open
          tone="destructive"
          loading={isConfirmPending}
          title={confirmCopy.title}
          description={confirmCopy.body}
          confirmLabel={
            isConfirmPending ? t("communities:common.loading") : confirmCopy.cta
          }
          onClose={() => setConfirming(null)}
          onConfirm={() => {
            if (confirming.kind === "removeMember") {
              confirmRemoveMember(confirming.memberSlug, confirming.name);
            } else {
              confirmRemoveReport(confirming.report);
            }
          }}
        />
      )}
    </div>
  );
}
