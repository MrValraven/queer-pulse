import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import type { LivingCommunity } from "./community.model";
import { useJoinRequests } from "./api/useJoinRequests";
import {
  useRemoveMember,
  useReviewJoinRequest,
} from "./api/useCommunityMutations";
import {
  ModJoinRequests,
  ModMemberManagement,
  ModReportedPosts,
} from "./ModToolsSections";

export function ModToolsTab({ living }: { living: LivingCommunity }) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { approveRequest, promoteToMod } = useCommunityMembership();
  const reviewRequest = useReviewJoinRequest(living.slug);
  const removeMember = useRemoveMember(living.slug);

  // Join requests come from the join-requests endpoint (demo returns the mock
  // queue synchronously). A local resolved-id set owns the moderator's in-session
  // approve/dismiss; the visible list derives from the (re-syncing) hook minus
  // those ids, so a live invalidation refetch flows through without an effect.
  const joinRequests = useJoinRequests(living.slug);
  const [resolvedRequests, setResolvedRequests] = useState<Set<string>>(
    new Set(),
  );
  const requests = joinRequests.filter((r) => !resolvedRequests.has(r.id));
  const [reports, setReports] = useState(living.reports ?? []);
  const [promoted, setPromoted] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const resolveRequest = (id: string, name: string, approved: boolean) => {
    setResolvedRequests((prev) => new Set(prev).add(id));
    if (approved) approveRequest(living.slug);
    reviewRequest.mutate({ id, action: approved ? "approve" : "decline" });
    showToast(
      approved
        ? t("communities:detail.modtools.toast.approved", { name })
        : t("communities:detail.modtools.toast.declined", { name }),
      approved ? "success" : "info",
    );
  };
  const resolveReport = (id: string, removedPost: boolean) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(
      removedPost
        ? t("communities:detail.modtools.toast.postRemoved")
        : t("communities:detail.modtools.toast.reportDismissed"),
      removedPost ? "success" : "info",
    );
  };
  const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";
  const promote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setPromoted((p) => [...p, key]);
    promoteToMod(living.slug, key);
    showToast(t("communities:detail.modtools.toast.promoted", { name }), "success");
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
      <ModJoinRequests requests={requests} onResolve={resolveRequest} />
      <ModReportedPosts reports={reports} onResolve={resolveReport} />
      <ModMemberManagement
        members={manageable}
        memberKey={memberKey}
        promoted={promoted}
        onPromote={promote}
        onRemove={remove}
      />
    </div>
  );
}
