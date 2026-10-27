import { lazyNamed } from "../../app/routeHelpers";
import { useStudioAccess } from "./api/useStudioAccess";

const StudioLandingPage = lazyNamed(
  () => import("./landing/StudioLandingPage"),
  "StudioLandingPage",
);
const StudioAccessErrorPage = lazyNamed(
  () => import("./StudioAccessErrorPage"),
  "StudioAccessErrorPage",
);

/** Every path a visitor without a grant opens: they get the Studio landing.
 *  A failed access read is told apart from a real denial: it gets the
 *  Studio-framed error with the reason and Retry, so a granted creator in an
 *  outage never reads the landing as a revoked grant. */
export function StudioUngrantedPage() {
  const { isReadFailed } = useStudioAccess();
  return isReadFailed ? <StudioAccessErrorPage /> : <StudioLandingPage />;
}
