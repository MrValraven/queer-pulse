import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LivingCommunity, ModReport } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { useJoinRequests } from "./api/useJoinRequests";
import { useCommunityReports } from "./api/useCommunityReports";
import {
  useDeleteCommunityPost,
  useDismissCommunityReport,
  useRemoveMember,
  useReviewJoinRequest,
  useSetMemberRole,
} from "./api/useCommunityMutations";
import {
  ModJoinRequests,
  ModMemberManagement,
  ModReportedPosts,
} from "./ModToolsSections";
import { ModToolsInsights } from "./ModToolsInsights";
import { CommunityDangerZone } from "./CommunityDangerZone";

export function ModToolsTab({
  living,
  role,
  communityName,
}: {
  living: LivingCommunity;
  role: CommunityRole | null;
  communityName: string;
}) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const reviewRequest = useReviewJoinRequest(living.slug);
  const removeMember = useRemoveMember(living.slug);
  const setMemberRole = useSetMemberRole(living.slug);
  const deletePost = useDeleteCommunityPost(living.slug);
  const dismissReport = useDismissCommunityReport(living.slug);

  // Join requests come from the join-requests endpoint (demo returns the mock
  // queue synchronously). A local resolved-id set owns the moderator's in-session
  // approve/dismiss; the visible list derives from the (re-syncing) hook minus
  // those ids, so a live invalidation refetch flows through without an effect.
  const joinRequests = useJoinRequests(living.slug);
  const [resolvedRequests, setResolvedRequests] = useState<Set<string>>(
    new Set(),
  );
  const requests = joinRequests.filter((r) => !resolvedRequests.has(r.id));

  // Reports mirror the same pattern, now backed by GET /communities/:slug/reports
  // (owner/mod-only) instead of the permanently-empty `living.reports` live had
  // before — demo keeps reading the flagship's mock queue via the same hook.
  const communityReports = useCommunityReports(living.slug);
  const [resolvedReports, setResolvedReports] = useState<Set<string>>(
    new Set(),
  );
  const reports = communityReports.filter((r) => !resolvedReports.has(r.id));

  const [promoted, setPromoted] = useState<string[]>([]);
  const [demoted, setDemoted] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const resolveRequest = (id: string, name: string, approved: boolean) => {
    setResolvedRequests((prev) => new Set(prev).add(id));
    reviewRequest.mutate({ id, action: approved ? "approve" : "decline" });
    showToast(
      approved
        ? t("communities:detail.modtools.toast.approved", { name })
        : t("communities:detail.modtools.toast.declined", { name }),
      approved ? "success" : "info",
    );
  };
  // "Remove post" reuses the existing owner/mod delete-post action; only wired
  // for post-subject reports (see `ModReportedPosts`'s `canRemove`). "Dismiss"
  // hits the platform moderation-action endpoint (see `useDismissCommunityReport`
  // for the known community-mod/platform-role gap that can 403 here).
  const removeReport = (report: ModReport) => {
    setResolvedReports((prev) => new Set(prev).add(report.id));
    if (report.subjectId) deletePost.mutate({ id: report.subjectId });
    showToast(t("communities:detail.modtools.toast.postRemoved"), "success");
  };
  const dismissReportRow = (report: ModReport) => {
    setResolvedReports((prev) => new Set(prev).add(report.id));
    dismissReport.mutate({ id: report.id });
    showToast(t("communities:detail.modtools.toast.reportDismissed"), "info");
  };

  const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";
  const promote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    // Local list drives the row's badge immediately (same shape as `removed`);
    // the PATCH is the real change, and its invalidation refetches the roster.
    setPromoted((p) => [...p, key]);
    setDemoted((d) => d.filter((k) => k !== key));
    if (slug) setMemberRole.mutate({ memberSlug: slug, role: "mod" });
    showToast(
      t("communities:detail.modtools.toast.promoted", { name }),
      "success",
    );
  };
  const demote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setDemoted((d) => [...d, key]);
    setPromoted((p) => p.filter((k) => k !== key));
    if (slug) setMemberRole.mutate({ memberSlug: slug, role: "member" });
    showToast(
      t("communities:detail.modtools.toast.demoted", { name }),
      "info",
    );
  };
  const remove = (slug: string | undefined, name: string) => {
    setRemoved((p) => [...p, memberKey(slug, name)]);
    if (slug) removeMember.mutate(slug);
    showToast(t("communities:detail.modtools.toast.removed", { name }), "info");
  };

  const manageable = living.roster.filter(
    (m) => !removed.includes(memberKey(m.slug, m.name)),
  );

  return (
    <div>
      <ModToolsInsights slug={living.slug} />
      <ModJoinRequests requests={requests} onResolve={resolveRequest} />
      <ModReportedPosts
        reports={reports}
        onRemove={removeReport}
        onDismiss={dismissReportRow}
      />
      <ModMemberManagement
        members={manageable}
        memberKey={memberKey}
        promoted={promoted}
        demoted={demoted}
        onPromote={promote}
        onDemote={demote}
        onRemove={remove}
      />
      <CommunityDangerZone
        slug={living.slug}
        name={communityName}
        role={role}
        roster={manageable}
      />
    </div>
  );
}
