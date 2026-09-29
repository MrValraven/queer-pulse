import { Navigate, useSearchParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { DeckEditorPage } from "./DeckEditorPage";

/**
 * The deck editor's route guard. In live mode every deck starts from the desk
 * ("Build a deck", or a deck piece's "Open the draft"), so the editor always
 * opens on a deck a piece owns, which publishes through its piece. A bare
 * `/magazine/editor/deck` with no `?id=` goes back to the desk. Demo mode
 * saves nothing and keeps the blank editor for a walkthrough.
 */
export function DeckEditorRoute() {
  const [searchParams] = useSearchParams();
  const { demoMode } = useDemoMode();
  const hasDeckId = Boolean(searchParams.get("id"));

  if (!hasDeckId && !demoMode) {
    return <Navigate to={routes.magazineEditor} replace />;
  }
  return <DeckEditorPage />;
}
