import type { Language } from "../../../shared/i18n/types";

/** The brand name in the email's chrome. Colours and type live in
 *  `emailDesign.ts`. */
export const EMAIL_WORDMARK = "QueerPulse";

/** The public site, for links inside an email's own chrome (footers). Fixed on
 *  purpose: `appOrigin()` in `src/shared/lib/inviteUrl.ts` returns the running
 *  instance (localhost in dev), and a pasted email must always point at the
 *  real site. Its off-browser fallback is this same origin. */
export const EMAIL_SITE_URL = "https://queerpulse.com";

/** Part of the email itself (it travels in the clipboard), so it lives here
 *  beside the rest of the email's markup rather than in a UI catalog. */
export const EMAIL_FOOTER: Record<Language, string> = {
  en: "You are getting this because you asked to join QueerPulse.",
  pt: "Recebes isto porque pediste para entrar no QueerPulse.",
};
