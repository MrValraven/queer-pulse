import { inviteLink } from "../../app/routeMap";

/**
 * The one place invite links are built.
 *
 * Two rules this exists to enforce:
 *
 * 1. **The path comes from the route map**, never a literal. `invite.data.ts`
 *    used to hardcode `/invite/${code}`, which only worked because
 *    `routes.tsx` redirects `/invite/:code` → `/auth/invite/:code`. That is a
 *    live redirect on links people actually receive, and it would break
 *    silently the day the redirect is tidied away.
 * 2. **The origin is the running instance**, so a copied link opens where it
 *    was made — `localhost:5173` in dev, the real domain in production —
 *    rather than always pointing at prod.
 *
 * The backend deliberately returns invite **codes** and never URLs (it must not
 * assume the frontend's origin), so composing the link is the client's job.
 */

/** Used off-browser (SSR/tests) where there is no origin to read. */
const FALLBACK_ORIGIN = "https://queerpulse.com";

/** Origin of the running app, e.g. `https://queerpulse.com`. */
export const appOrigin = (): string =>
  typeof window !== "undefined" ? window.location.origin : FALLBACK_ORIGIN;

/** Origin without its scheme, e.g. `queerpulse.com` / `localhost:5173`. */
export const appHost = (): string => appOrigin().replace(/^https?:\/\//, "");

/**
 * Short, human-readable invite link — no scheme. For display in a URL field or
 * preview card, not for copying.
 */
export const inviteUrlFor = (code: string): string =>
  `${appHost()}${inviteLink(code)}`;

/** The real, clickable invite link — this is what gets copied and shared. */
export const inviteFullUrlFor = (code: string): string =>
  `${appOrigin()}${inviteLink(code)}`;
