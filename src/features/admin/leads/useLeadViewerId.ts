import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { DEMO_LEAD_VIEWER_ID } from "./leadsDemoViewer";

/**
 * The signed-in staff member's user id, so an assignee row can read "You"
 * when its id matches. Demo answers the demo viewer's staff id; live answers
 * the session user's id, or null while signed out.
 */
export function useLeadViewerId(): string | null {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  if (demoMode) return DEMO_LEAD_VIEWER_ID;
  return user?.id ?? null;
}
