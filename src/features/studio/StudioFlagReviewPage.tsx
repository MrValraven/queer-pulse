import { Studio404Page } from "./Studio404Page";
import { StudioFlagReviewLive } from "./StudioFlagReviewLive";
import { StudioFlagReviewShowcase } from "./StudioFlagReviewShowcase";
import { useIsStudioStaff } from "./useIsStudioStaff";
import { useStudioShowcase } from "./useStudioShowcase";

/** Staff review of Studio reports and disputes (spec 7.2). The demo keeps
 *  its showcase council flags; live is for Moderators and Admins, and anyone
 *  else gets the Studio 404. */
export function StudioFlagReviewPage() {
  const isShowcase = useStudioShowcase();
  const isStaff = useIsStudioStaff();
  if (isShowcase) return <StudioFlagReviewShowcase />;
  if (!isStaff) return <Studio404Page />;
  return <StudioFlagReviewLive />;
}
