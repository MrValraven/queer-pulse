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

/**
 * Words the namespace keeps for itself, in three sorted groups.
 *
 * ROUTE COLLISIONS shadow a top-level path in the app. IMPERSONATION are names
 * a reader could take as the platform itself speaking: staff identity here is a
 * badge rather than a name, so a member holding `@support` or `@moderator`
 * could open a DM that reads as an official one. INTERNAL SENTINELS are strings
 * the platform itself has used as an id. The backend `common/handles.ts`
 * carries the full reasoning for which words qualify; keep both lists identical.
 */
export const RESERVED_HANDLES = [
  // Route collisions.
  "account",
  "admin",
  "api",
  "directory",
  "me",
  "members",
  "p",
  "profile",
  "profiles",
  // The opt-in anonymous page, `/public-profile/:slug` (PRD-204).
  "public-profile",
  "settings",
  "subprofiles",
  // Impersonation: the platform's own voice.
  "abuse",
  "admins",
  "billing",
  "contact",
  "help",
  "helpdesk",
  "info",
  "legal",
  "mod",
  "moderation",
  "moderator",
  "moderators",
  "mods",
  "no-reply",
  "noreply",
  "notification",
  "notifications",
  "official",
  "press",
  "queer-pulse",
  "queerpulse",
  "root",
  "safety",
  "security",
  "staff",
  "support",
  "system",
  "team",
  "trust",
  "verified",
  // Internal sentinels: `unspecified` is the subject id the public safety form
  // filed every report under before ENG-483.
  "unspecified",
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
