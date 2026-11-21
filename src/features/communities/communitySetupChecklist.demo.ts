import type {
  CommunitySetupChecklistDTO,
  UpdateCommunityDto,
} from "./api/communities.api";
import type { LivingCommunity } from "./community.model";
import { isStaffRole } from "./communityStaffRole";
import type { CommunityRole } from "./membership.types";

/**
 * Demo only: what `useCommunity` reads to build the setup checklist facts the
 * live detail would carry under `setupChecklist`.
 */
export interface DemoSetupChecklistInput {
  /** The demo viewer's role in this community, or null for a visitor. */
  role: CommunityRole | null;
  /** True for a space (subcommunity), which never shows the checklist. */
  isSpace: boolean;
  /** The flagship fixture, or undefined for a community with none. */
  living: LivingCommunity | undefined;
  /** Stewards on a community founded this session, else null. */
  foundingStewardCount: number | null;
  /** Posts shared into this community this session
   *  (`useDemoSharedPosts(slug).length`). */
  sharedPostCount: number;
  /** The session edit override, which holds a demo dismissal. */
  override: UpdateCommunityDto | undefined;
}

/**
 * The demo mirror of the server's checklist facts. Null unless the viewer is
 * staff (owner, co-owner or mod) of a top-level community, the same audience
 * the live detail sends the facts to.
 */
export function demoSetupChecklistFor(
  input: DemoSetupChecklistInput,
): CommunitySetupChecklistDTO | null {
  const {
    role,
    isSpace,
    living,
    foundingStewardCount,
    sharedPostCount,
    override,
  } = input;
  if (!isStaffRole(role) || isSpace) return null;
  const staffCount = living
    ? Math.max(
        1,
        living.roster.filter((entry) => isStaffRole(entry.role)).length,
      )
    : (foundingStewardCount ?? 1);
  const postCount =
    (living?.pinned.length ?? 0) +
    (living?.pulse.length ?? 0) +
    sharedPostCount;
  return {
    isDismissed: override?.setupChecklistDismissed === true,
    staffCount,
    postCount,
  };
}
