import { useSearchParams } from "react-router-dom";
import type { Community } from "../homepage/data/types";
import type {
  CommunityDetail,
  Person,
  Thread as ThreadData,
} from "./communityDetails";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { PulsePaging } from "./api/useCommunityPosts";
import type { CommunityPulseResult } from "./api/useCommunityPulse";
import { LivingHubTabs } from "./LivingHubTabs";
import { FallbackHubTabs } from "./FallbackHubTabs";
import { CommunitySidebar } from "./CommunitySidebar";
import { isCommunityStaff } from "./communityStaff";
import styles from "./CommunityDetailPage.module.css";

/**
 * The community hub's two-column body: the tabs, and the sidebar beside them.
 *
 * The sidebar is conditional because Mod tools is a two-column console of its
 * own (a section rail plus one pane). Leaving the sidebar up there would make
 * the page three columns and squeeze the pane, and "related communities" is
 * not what a moderator opened this tab for. The staff check mirrors
 * `LivingHubTabs`' own fallback, so a member forging `?tab=modtools` loses
 * nothing.
 */
export function CommunityHubLayout({
  community,
  detail,
  living,
  slug,
  threads,
  joined,
  role,
  canEdit,
  members,
  memberNum,
  hasCount,
  posts,
  discussionPaging,
  rosterResult,
  related,
  communityPulse,
}: {
  community: Community;
  detail: CommunityDetail;
  living: LivingCommunity | null | undefined;
  slug: string | undefined;
  threads: ThreadData[];
  joined: boolean;
  role: CommunityRole | null;
  canEdit: boolean;
  members: Person[];
  memberNum: number;
  hasCount: boolean;
  posts: PulsePaging;
  discussionPaging: PulsePaging;
  rosterResult: PulsePaging;
  related: Community[];
  communityPulse: CommunityPulseResult;
}) {
  const [searchParams] = useSearchParams();
  const isModConsoleOpen =
    living != null &&
    isCommunityStaff(role) &&
    searchParams.get("tab") === "modtools";

  return (
    <div
      className={[styles.layout, isModConsoleOpen && styles.layoutWide]
        .filter(Boolean)
        .join(" ")}
    >
      {living ? (
        <LivingHubTabs
          community={community}
          info={detail}
          living={living}
          threads={threads}
          slug={living.slug}
          isMember={joined}
          role={role}
          pulsePaging={posts}
          discussionPaging={discussionPaging}
          rosterPaging={rosterResult}
          communityPulse={communityPulse}
        />
      ) : (
        <FallbackHubTabs
          detail={detail}
          members={members}
          hasCount={hasCount}
          memberNum={memberNum}
          threads={threads}
          slug={slug ?? ""}
          isMember={joined}
          canModerate={canEdit}
          discussionPaging={discussionPaging}
        />
      )}

      {!isModConsoleOpen && (
        <CommunitySidebar
          detail={detail}
          related={related}
          communityPulse={communityPulse}
        />
      )}
    </div>
  );
}
