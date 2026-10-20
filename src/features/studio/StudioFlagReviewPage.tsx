import { Studio404Page } from "./Studio404Page";
import { StudioFlagReviewLive } from "./StudioFlagReviewLive";
import { useIsStudioStaff } from "./useIsStudioStaff";

/** Staff review of Studio reports, claims and disputes (spec 7.2). The demo
 *  opens it to everyone (`useIsStudioStaff`) and runs the same tabs on the
 *  demo queues; live is for Moderators and Admins, and anyone else gets the
 *  Studio 404. */
export function StudioFlagReviewPage() {
  const isStaff = useIsStudioStaff();
  if (!isStaff) return <Studio404Page />;
  return <StudioFlagReviewLive />;
}
