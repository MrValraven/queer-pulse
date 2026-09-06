import { Navigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";

/**
 * The three legacy first-person story paths (`/magazine/story`,
 * `/magazine/story-tomas`, `/magazine/story-safety`) resolve to regular
 * articles in the demo registry, so demo mode still lands on the curated
 * piece each path was written for.
 *
 * Live mode has no article at those slugs: they name demo fixtures, so the
 * old redirect sent a live reader to `/magazine/article?id=<mock slug>` and
 * straight into the "Article not found" wall (PRD-101). A legacy path with no
 * live subject behind it belongs on the magazine front, where the current
 * issue's real run order is, so the reader lands on something published
 * instead of a dead end.
 */
export function MagazineStoryRedirect({ articleId }: { articleId: string }) {
  const { demoMode } = useDemoMode();
  return (
    <Navigate
      to={demoMode ? `${routes.article}?id=${articleId}` : routes.magazine}
      replace
    />
  );
}
