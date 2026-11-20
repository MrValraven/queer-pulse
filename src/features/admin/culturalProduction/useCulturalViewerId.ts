import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { DEMO_CULTURAL_VIEWER_ID } from "./culturalProductionDemoViewer";

/**
 * The signed-in staff member's user id, so an assignee, backer or author
 * row can read "You" when its id matches. Demo answers the demo viewer's
 * id (the id the demo store writes); live answers the session user's id,
 * or null while signed out.
 */
export function useCulturalViewerId(): string | null {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  if (demoMode) return DEMO_CULTURAL_VIEWER_ID;
  return user?.id ?? null;
}
