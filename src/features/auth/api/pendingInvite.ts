/**
 * Stashes the **welcome** payload (the inviter and their vouch) so the
 * onboarding "you're in" step can greet the new member by name. The in-memory
 * invite is gone after the full-page Google auth redirect, so it has to
 * survive in sessionStorage.
 *
 * There used to be a second key here holding the invite CODE. It was never
 * read: the code rides the OAuth `state` param and the backend consumes it
 * during sign-up (`validateInviteForSignup` + `claimInvite`), and the one
 * reader (`consumePendingInvite`, for a prototype /auth/create-account page)
 * had already been deleted along with that page. A write with no reader is a
 * trap: the next person to find `qp.pendingInvite` in storage would reasonably
 * read it as an UNREDEEMED invite. Removed rather than left lying.
 */
const WELCOME_KEY = "qp.inviteWelcome";

/** The inviter + vouch the onboarding "you're in" step greets the new member with. */
export interface InviteWelcome {
  vouch?: string;
  inviter: {
    name: string;
    firstName: string;
    initials: string;
    since?: string;
    photo?: string;
  };
}

/** Stash the welcome payload so onboarding can greet the member with who vouched. */
export function rememberInviteWelcome(welcome: InviteWelcome): void {
  try {
    sessionStorage.setItem(WELCOME_KEY, JSON.stringify(welcome));
  } catch {
    /* storage unavailable — onboarding falls back to its default welcome */
  }
}

/** Read the welcome payload (without clearing it); null when not invited in. */
export function readInviteWelcome(): InviteWelcome | null {
  try {
    const raw = sessionStorage.getItem(WELCOME_KEY);
    return raw ? (JSON.parse(raw) as InviteWelcome) : null;
  } catch {
    return null;
  }
}

/** Clear the welcome payload once onboarding is done with it. */
export function clearInviteWelcome(): void {
  try {
    sessionStorage.removeItem(WELCOME_KEY);
  } catch {
    /* nothing to clear */
  }
}
