/**
 * Stashes what the join flow needs to survive the hop from the landing page
 * (`/auth/invite/:code`) through Google auth into `/onboarding`:
 *  - the invite **code**. NOTE: it is no longer redeemed from here — the code
 *    rides the OAuth `state` param and the backend consumes it during sign-up
 *    (`validateInviteForSignup` + `claimInvite`). It is still stashed so the
 *    prototype /auth/create-account page can clear it, and as the record of
 *    which invite brought someone in;
 *  - the **welcome** payload (inviter + their vouch) shown on the onboarding
 *    "you're in" step, since the in-memory invite is gone after a full-page auth
 *    redirect.
 */
const CODE_KEY = "qp.pendingInvite";
const WELCOME_KEY = "qp.inviteWelcome";

/** Remember the code the recipient is signing up against. */
export function rememberPendingInvite(code: string): void {
  try {
    sessionStorage.setItem(CODE_KEY, code);
  } catch {
    /* storage unavailable (private mode) — the Google path still has the code directly */
  }
}

/** Read and clear the pending code; null when there's no invite in flight. */
export function consumePendingInvite(): string | null {
  try {
    const code = sessionStorage.getItem(CODE_KEY);
    if (code) sessionStorage.removeItem(CODE_KEY);
    return code;
  } catch {
    return null;
  }
}

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
