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
import { ModToolsInvites } from "./ModToolsInvites";
import { ModToolsBans } from "./ModToolsBans";
import { CommunityDangerZone } from "./CommunityDangerZone";
import { useModToolsActions } from "./useModToolsActions";
import { modConfirmCopy } from "./modToolsConfirm";

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
    roleOverrides,
    resolveRequest,
    promote,
    demote,
    confirmGrantCoOwner,
    confirmRevokeCoOwner,
    dismissReportRow,
    confirming,
    setConfirming,
    confirmRemoveMember,
    confirmRemoveReport,
    isConfirmPending,
    isRequestPending,
  } = useModToolsActions(living);

  const confirmCopy = confirming ? modConfirmCopy(confirming, t) : null;

  return (
    <div>
      <ModToolsInsights slug={living.slug} />
      <ModJoinRequests
        requests={requests}
        state={requestsState}
        onResolve={resolveRequest}
        isPending={isRequestPending}
      />
      <ModToolsInvites slug={living.slug} />
      <ModReportedPosts
        reports={reports}
        state={reportsState}
        onRemove={(report) => setConfirming({ kind: "removeReport", report })}
        onDismiss={dismissReportRow}
      />
      <ModMemberManagement
        members={manageable}
        memberKey={memberKey}
        roleOverrides={roleOverrides}
        viewerRole={role}
        paging={rosterPaging}
        onPromote={promote}
        onDemote={demote}
        onGrantCoOwner={(memberSlug, name) =>
          setConfirming({ kind: "grantCoOwner", memberSlug, name })
        }
        onRevokeCoOwner={(memberSlug, name) =>
          setConfirming({ kind: "revokeCoOwner", memberSlug, name })
        }
        onRemove={(memberSlug, name) =>
          setConfirming({ kind: "removeMember", memberSlug, name })
        }
      />
      <ModToolsBans slug={living.slug} />
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

      {/* Removing a member, taking a post down and moving someone in or out of
          co-ownership are each confirmed first — the same rule the danger zone
          below already follows. */}
      {confirming && confirmCopy && (
        <ConfirmDialog
          open
          tone={confirmCopy.tone}
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
            } else if (confirming.kind === "grantCoOwner") {
              confirmGrantCoOwner(confirming.memberSlug, confirming.name);
            } else if (confirming.kind === "revokeCoOwner") {
              confirmRevokeCoOwner(confirming.memberSlug, confirming.name);
            } else {
              confirmRemoveReport(confirming.report);
            }
          }}
        />
      )}
    </div>
  );
}
