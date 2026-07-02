import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useCommunityMembership } from "../../app/providers/CommunityMembershipProvider";
import type { LivingCommunity } from "./community.model";
import {
  ModJoinRequests,
  ModMemberManagement,
  ModReportedPosts,
} from "./ModToolsSections";

export function ModToolsTab({ living }: { living: LivingCommunity }) {
  const { showToast } = useToast();
  const { approveRequest, promoteToMod } = useCommunityMembership();

  // Intentional: seed local state from the prop once as a snapshot, then mutate
  // it locally (approve/dismiss). This is not a live sync — the moderator's
  // in-session actions own the list after mount.
  const [requests, setRequests] = useState(living.joinRequests ?? []);
  const [reports, setReports] = useState(living.reports ?? []);
  const [promoted, setPromoted] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const resolveRequest = (id: string, name: string, approved: boolean) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    if (approved) approveRequest(living.slug);
    showToast(
      approved
        ? `${name} approved — welcome them in.`
        : `${name}'s request wasn't approved this time.`,
      approved ? "success" : "info",
    );
  };
  const resolveReport = (id: string, removedPost: boolean) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    showToast(
      removedPost
        ? "Post removed. The author has been reached."
        : "Report dismissed.",
      removedPost ? "success" : "info",
    );
  };
  const memberKey = (slug?: string, name?: string) => slug ?? name ?? "";
  const promote = (slug: string | undefined, name: string) => {
    const key = memberKey(slug, name);
    setPromoted((p) => [...p, key]);
    promoteToMod(living.slug, key);
    showToast(`${name} is now a mod.`, "success");
  };
  const remove = (slug: string | undefined, name: string) => {
    setRemoved((p) => [...p, memberKey(slug, name)]);
    showToast(`${name} has been removed.`, "info");
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
