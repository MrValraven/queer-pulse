import { useRef } from "react";
import type { Community } from "../homepage/data/types";
import type { CommunityDetail, Thread as ThreadData } from "./communityDetails";
import type { LivingCommunity } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { Person } from "./communityDetails";
import type { PulsePaging } from "./api/useCommunityPosts";
import type { CommunityPulseResult } from "./api/useCommunityPulse";
import type { SetupChecklistView } from "./communitySetupChecklist.model";
import type { EditCommunityFocusField } from "./editCommunityFocusField";
import { CommunityFrozenBanner } from "./CommunityFrozenBanner";
import { CommunityRulesUpdateNotice } from "./CommunityRulesUpdateNotice";
import { CommunitySetupChecklist } from "./CommunitySetupChecklist";
import { CommunityHubLayout } from "./CommunityHubLayout";
import { SimilarCommunitiesSection } from "./SimilarCommunitiesSection";
import styles from "./CommunityDetailPage.module.css";
import setupChecklistStyles from "./CommunitySetupChecklist.module.css";

/**
 * Everything below the hero on a resolved community page: the frozen-pause
 * banner, the house-rules-changed notice, the steward's setup checklist, the
 * two-column hub (tabs + sidebar), and the "similar communities" shelf.
 * Split out of `CommunityDetailPage` purely to keep that component under the
 * repo's 200-line limit; it holds only the ref that takes focus after a
 * checklist dismissal.
 */
export function CommunityDetailBody({
  community,
  detail,
  living,
  slug,
  discussionThreads,
  joined,
  isRosterMember,
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
  setupChecklist,
  onOpenEditAt,
}: {
  community: Community;
  detail: CommunityDetail;
  living: LivingCommunity | undefined;
  slug: string | undefined;
  discussionThreads: ThreadData[];
  joined: boolean;
  /** The viewer's own roster row here, which the rules notice needs: the
   *  preferences it reads exist only for a roster row. */
  isRosterMember: boolean;
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
  /** The steward's setup checklist, or null when the card stays hidden. */
  setupChecklist: SetupChecklistView | null;
  /** Opens the edit modal onto the field a checklist row names. */
  onOpenEditAt: (field: EditCommunityFocusField) => void;
}) {
  // Where focus lands when Dismiss checklist folds the card away: the start
  // of the hub, which moves up into the card's place.
  const hubStartRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.body}>
      <div className="wrap">
        {(living?.frozen || detail.frozen) && slug && (
          <CommunityFrozenBanner
            slug={slug}
            canManage={canEdit}
            parentName={living?.parent?.name}
          />
        )}
        {/* An owner edited the house rules since this member agreed to them.
            In-page and dismissible on purpose: reading the community is
            never blocked behind re-agreeing. */}
        {slug && (
          <CommunityRulesUpdateNotice
            slug={slug}
            name={community.name}
            isMember={isRosterMember}
          />
        )}
        {slug && (
          <CommunitySetupChecklist
            slug={slug}
            communityName={community.name}
            view={setupChecklist}
            onOpenEditAt={onOpenEditAt}
            focusAfterDismissRef={hubStartRef}
          />
        )}
        <div
          ref={hubStartRef}
          tabIndex={-1}
          className={setupChecklistStyles.focusAfterDismiss}
        >
          <CommunityHubLayout
            community={community}
            detail={detail}
            living={living}
            slug={slug}
            threads={discussionThreads}
            joined={joined}
            role={role}
            canEdit={canEdit}
            members={members}
            memberNum={memberNum}
            hasCount={hasCount}
            posts={posts}
            discussionPaging={discussionPaging}
            rosterResult={rosterResult}
            related={related}
            communityPulse={communityPulse}
          />
        </div>

        {slug && <SimilarCommunitiesSection currentSlug={slug} />}
      </div>
    </div>
  );
}
