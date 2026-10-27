import { lazyNamed } from "../../app/routeHelpers";
import { useAuth } from "../../app/providers/authContext";
import { VisitorPreview } from "../../shared/components/layout/VisitorPreview";
import { useIsVisitorPreviewRequested } from "../../shared/components/layout/visitorPreviewContext";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioRoom } from "./StudioRoom";
import { StudioUngrantedPage } from "./StudioUngrantedPage";

const StudioLandingPage = lazyNamed(
  () => import("./landing/StudioLandingPage"),
  "StudioLandingPage",
);

/**
 * /studio is auth-aware: a signed-in member with a Studio grant lands
 * straight on the Studio home, and everyone else gets the Studio landing.
 * Live mode only mounts this page for granted members (`studioRoutes`), so
 * there the landing branch covers a signed-out session. In demo every member
 * is granted unless `?studioAccess=off` is on, which shows the landing with
 * its member note.
 *
 * A staffer's visitor preview (`/studio?preview=visitor`, see
 * `visitorPreviewContext.ts`) shows what a signed-out visitor gets here.
 */
export function StudioPage() {
  const { loggedIn } = useAuth();
  const { hasAccess } = useStudioAccess();
  const isVisitorPreview = useIsVisitorPreviewRequested();
  if (isVisitorPreview) {
    return (
      <VisitorPreview>
        <StudioVisitorView />
      </VisitorPreview>
    );
  }
  return loggedIn && hasAccess ? <StudioRoom /> : <StudioLandingPage />;
}

/**
 * The page a signed-out visitor reaches at /studio, in demo and live alike.
 * It renders `StudioUngrantedPage`, the same page `studioRoutes` gives every
 * visitor without a grant: the Studio landing, or the Studio access error
 * when the access read failed.
 */
function StudioVisitorView() {
  return <StudioUngrantedPage />;
}
