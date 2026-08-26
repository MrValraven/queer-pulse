import { routes } from "../../../app/routeMap";
import { safeStorage } from "../../../shared/storage/safeStorage";
import { isWellFormedStatusToken } from "./joinRequest.api";

/**
 * The applicant's status token, kept across tab closes.
 *
 * Why localStorage and not the sessionStorage `pendingInvite.ts` uses: this
 * token is the ONLY route back to a decision that takes days, and no email
 * exists (or ever will) to re-deliver it. A session-scoped store would drop it
 * the moment the tab closed, which is roughly the moment the applicant walks
 * away to wait.
 *
 * Namespaced `qp.` like every other key this app owns (`qp.lang`,
 * `qp.demoMode.v1`, `qp.drafts.v1`) and versioned, so a future shape change can
 * be told apart from this one instead of parsed into nonsense.
 *
 * Every access goes through `safeStorage`, which is the repo's one guarded
 * seam: a private window, a browser set to block site data, or a full quota all
 * throw on a raw `localStorage` call, and none of those may take the
 * confirmation screen down with them. The code is on screen either way, which
 * is exactly why showing it is not optional.
 */
const STORAGE_KEY = "qp.joinRequestStatus.v1";

/** The token plus enough context for the status page to say something sensible
 *  before, or without, a network answer. */
export interface StoredJoinRequestStatus {
  /** The opaque status token from the submission's 201. */
  token: string;
  /** ISO 8601 — when the request was submitted, per the same 201. */
  submittedAt: string;
}

function isStoredShape(value: unknown): value is StoredJoinRequestStatus {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<StoredJoinRequestStatus>;
  return (
    typeof candidate.token === "string" &&
    isWellFormedStatusToken(candidate.token) &&
    typeof candidate.submittedAt === "string" &&
    candidate.submittedAt.length > 0
  );
}

/**
 * Remember the most recent request's token, replacing any earlier one.
 *
 * Last-write-wins rather than a list, deliberately: a second submission from
 * this browser is the request the applicant is now waiting on, and keeping a
 * history would only offer them stale codes to check.
 */
export function rememberJoinRequestStatus(
  status: StoredJoinRequestStatus,
): void {
  safeStorage.set(STORAGE_KEY, JSON.stringify(status));
}

/** The stored token, or null when there is none (or storage is unreadable, or
 *  what is there is not the shape this version writes). */
export function readJoinRequestStatus(): StoredJoinRequestStatus | null {
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isStoredShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * The status page with the code already in the query string, so the common path
 * from the confirmation screen is a single click rather than a copy-and-paste.
 * Lives here rather than beside the component so the component file exports
 * only components (react-refresh).
 */
export const joinRequestStatusLink = (token: string): string =>
  `${routes.joinRequestStatus}?token=${encodeURIComponent(token)}`;
