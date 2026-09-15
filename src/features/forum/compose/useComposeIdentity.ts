import { useMemo } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useConnectionsList } from "../../connect/api/useConnectionsList";
import { currentUser, fullName } from "../../members/data/members";
import type {
  ComposeCoAuthorOption,
  ComposePostingAsAuthor,
} from "./ComposePostingAs";

// ── Whose post this is ──────────────────────────────────────────────────────
// The byline block, the preview card and the first-post summary all describe
// the same person, so they read it from one place rather than each resolving
// the session on its own and disagreeing about the avatar.
//
// The demo persona and the real session are kept strictly apart: demo reads
// the mock `currentUser` ("Tiago Costa"), live reads `useAuth().user.profile`
// and NOTHING else, so the persona cannot reach a production byline. A live
// session with no resolved profile yields no author at all rather than
// borrowing one; compose is auth-gated, so that is a defensive state.
//
// Co-authors are the member's own connections. That is the whole population a
// co-written post can credit: the handle is resolved server-side and a stranger
// would be a 400, so offering anybody else would be offering a refusal.

export interface ComposeIdentity {
  /** The byline, or null while the session has not resolved one. */
  author: ComposePostingAsAuthor | null;
  /** Staff only. Without it the QueerPulse Official switch is not offered. */
  canPostAsOfficial: boolean;
  coAuthorOptions: ComposeCoAuthorOption[];
}

export function useComposeIdentity(): ComposeIdentity {
  const { demoMode } = useDemoMode();
  const { user, role } = useAuth();
  const { views } = useConnectionsList("all");

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

  const coAuthorOptions = useMemo<ComposeCoAuthorOption[]>(
    () =>
      views.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        initials: connection.initials,
        ...(connection.photo ? { photo: connection.photo } : {}),
      })),
    [views],
  );

  return { author, canPostAsOfficial: role === "admin", coAuthorOptions };
}
