/**
 * Per-member, per-device memory of when the push recovery prompt was last
 * dismissed. A per-viewer convenience, so it lives in localStorage and every
 * access is guarded: private mode or blocked site data must never throw.
 */
const KEY_PREFIX = "qp.pushRecovery.dismissedAt.";

export function readPushRecoveryDismissedAt(memberId: string): number | null {
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + memberId);
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writePushRecoveryDismissedAt(
  memberId: string,
  now: number,
): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + memberId, String(now));
  } catch {
    // Storage unavailable: the prompt simply returns on the next load.
  }
}
