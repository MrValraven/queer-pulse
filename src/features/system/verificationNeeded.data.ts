export type VerifyMethod = "password" | "2fa" | "magic";

export const VERIFY_TABS: { label: string; value: VerifyMethod }[] = [
  { label: "Password", value: "password" },
  { label: "2FA code", value: "2fa" },
  { label: "Magic link", value: "magic" },
];

export const CODE_LENGTH = 6;

/** Prototype only: the 2FA code that "matches" so the flow can be demoed. */
export const DEMO_2FA_CODE = "123456";

/** Email the re-auth magic link is "sent" to in the demo. */
export const REAUTH_EMAIL = "you@queerpulse.community";

/** How long the re-auth window stays open, in seconds (5 minutes). */
export const REAUTH_SECONDS = 300;

/** Seconds before a magic link can be resent. */
export const RESEND_COOLDOWN = 30;
