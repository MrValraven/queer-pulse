import { lazyNamed } from "../../app/routeHelpers";
import { useStudioAccess } from "./api/useStudioAccess";

const StudioComingSoonPage = lazyNamed(
  () => import("./StudioComingSoonPage"),
  "StudioComingSoonPage",
);
const StudioAccessErrorPage = lazyNamed(
  () => import("./StudioAccessErrorPage"),
  "StudioAccessErrorPage",
);

/** Every path a member without a grant opens. A failed access read is told
 *  apart from a real denial: it gets the Studio-framed error with the reason
 *  and Retry, so a granted creator in an outage never reads the teaser as a
 *  revoked grant. */
export function StudioUngrantedPage() {
  const { isReadFailed } = useStudioAccess();
  return isReadFailed ? <StudioAccessErrorPage /> : <StudioComingSoonPage />;
}
