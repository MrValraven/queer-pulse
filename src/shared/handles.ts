/**
 * Handle rules — the frontend MIRROR of the backend `common/handles.ts` (UC1).
 *
 * Main-profile usernames and subprofile handles share ONE global namespace, so
 * the format + reserved-word rules live here once and are reused by the Settings
 * username field and the subprofile handle field alike. Keep this in lockstep
 * with the backend module: same regex, same reserved list, same semantics.
 */

/** A handle is 3–30 chars: lowercase alphanumerics + hyphens, not hyphen-leading. */
export const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,29}$/;

/** Words the namespace keeps for itself (route prefixes, system paths). */
export const RESERVED_HANDLES = [
  "p",
  "me",
  "admin",
  "members",
  "profile",
  "profiles",
  "settings",
  "account",
  "api",
  "subprofiles",
  "directory",
];

/** Canonical form used for every comparison and storage: trimmed + lowercased. */
export function normalizeHandle(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Local, instant format check — no network. Returns `'invalid'` when the shape
 * is wrong, `'reserved'` when it's a kept word, or `null` when the format is
 * clean (availability against the registry still has to be checked server-side).
 */
export function handleFormatError(name: string): "invalid" | "reserved" | null {
  const n = normalizeHandle(name);
  if (!HANDLE_RE.test(n)) return "invalid";
  if (RESERVED_HANDLES.includes(n)) return "reserved";
  return null;
}
