import { useAuth } from "../../../../app/providers/authContext";

/**
 * Who is reading an audience page. `"checking"` while the live session is
 * still loading, so neither the invite request nor a member action shows
 * before the answer is in.
 */
export type AudienceViewer = "checking" | "guest" | "member";

export function useAudienceViewer(): AudienceViewer {
  const { loggedIn, checking } = useAuth();
  if (checking) return "checking";
  return loggedIn ? "member" : "guest";
}
