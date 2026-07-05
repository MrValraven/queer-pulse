import { useAuth } from "../../app/providers/authContext";
import { StudioRoom } from "./StudioRoom";
import { StudioLandingPage } from "./StudioLandingPage";

/**
 * /studio is auth-aware: logged-out visitors see the marketing landing, while
 * signed-in members land straight in the "This week" room.
 */
export function StudioPage() {
  const { loggedIn } = useAuth();
  return loggedIn ? <StudioRoom /> : <StudioLandingPage />;
}
