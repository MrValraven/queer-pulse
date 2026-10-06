import { useMemo } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { currentUser, fullName } from "../../members/data/members";
import type { ComposePostingAsAuthor } from "./ComposePostingAs";

// ── Whose post this is ──────────────────────────────────────────────────────
// The byline block, the preview card and the first-post summary all describe
// the same person, so they all read it from this one place and agree about
// the avatar.
//
// The demo persona and the real session are kept strictly apart: demo reads
// the mock `currentUser` ("Tiago Costa"), live reads `useAuth().user.profile`
// and NOTHING else, so the persona cannot reach a production byline. A live
// session with no resolved profile yields no author at all; compose is
// auth-gated, so that is a defensive state.
//
// Co-authors are picked elsewhere: `CoAuthorPicker` searches the member's
// connections on the server, and `useComposeCoAuthor` keeps the credited
// person's name for the byline.

export interface ComposeIdentity {
  /** The byline, or null while the session has not resolved one. */
  author: ComposePostingAsAuthor | null;
  /** Staff only. Without it the QueerPulse Official switch is not offered. */
  canPostAsOfficial: boolean;
}

export function useComposeIdentity(): ComposeIdentity {
  const { demoMode } = useDemoMode();
  const { user, role } = useAuth();

  const author = useMemo<ComposePostingAsAuthor | null>(() => {
    if (demoMode)
      return {
        name: fullName(currentUser),
        initials: currentUser.initials,
        ...(currentUser.photo ? { photo: currentUser.photo } : {}),
      };
    if (!user) return null;
    const { firstName, lastName, avatarUrl } = user.profile;
    return {
      name: `${firstName} ${lastName}`.trim(),
      initials: `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase(),
      ...(avatarUrl ? { photo: avatarUrl } : {}),
    };
  }, [demoMode, user]);

  return { author, canPostAsOfficial: role === "admin" };
}
