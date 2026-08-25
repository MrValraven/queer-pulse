import type { AdminTone, AvatarTone } from "./ui";
import type { GovernanceLogAction } from "./api/adminCommunityGovernanceLog.api";

/**
 * Static chrome for the community governance log reader. The demo fixture
 * itself lives in `adminCommunityGovernanceLog.mock.ts`, dynamically imported
 * so it never ships in the live bundle (same split as
 * `adminGovernance.data.ts` / `adminGovernance.mock.ts`).
 */

/** Chip colour per action: red for anything that takes something away, jade
 *  for anything that gives it back, violet for a handover, amber for a role
 *  move, plum for a settings edit. */
export const GOVERNANCE_ACTION_TONE: Record<GovernanceLogAction, AdminTone> = {
  role_changed: "amber",
  member_removed: "danger",
  ownership_transferred: "violet",
  owner_auto_promoted: "violet",
  frozen: "danger",
  unfrozen: "jade",
  archived: "danger",
  unarchived: "jade",
  settings_changed: "plum",
};

const TONE_CYCLE: AvatarTone[] = ["plum", "coral", "jade", "violet", "amber"];

/** Deterministic avatar tone from a member slug, so the same person keeps the
 *  same colour down the trail without the backend sending one. Mirrors
 *  `useAdminAudit`'s `toneFromId`. */
export function governanceAvatarTone(slug: string | null): AvatarTone {
  if (!slug) return "anon";
  let sum = 0;
  for (let index = 0; index < slug.length; index += 1) {
    sum += slug.charCodeAt(index);
  }
  return TONE_CYCLE[sum % TONE_CYCLE.length] ?? "plum";
}

/**
 * Metadata keys the reader renders through a dedicated line of its own, so the
 * generic "also recorded" list skips them and nothing gets printed twice.
 */
export const HANDLED_METADATA_KEYS = new Set([
  "adminOverride",
  "fromRole",
  "toRole",
  "reason",
  "changes",
]);

/** Roster roles the backend records in a `role_changed` entry. */
export const GOVERNANCE_ROLE_KEYS: Record<string, string> = {
  owner: "communities.governanceLog.meta.role.owner",
  mod: "communities.governanceLog.meta.role.mod",
  member: "communities.governanceLog.meta.role.member",
};

/**
 * Settings fields a `settings_changed` diff can name — the three admin
 * safety toggles plus every field the community's own PATCH diffs. A field
 * the frontend doesn't know yet falls back to a humanized version of the raw
 * camelCase key, the same way `AdminSettingsHistory` handles a new kill
 * switch.
 */
export const GOVERNANCE_FIELD_KEYS: Record<string, string> = {
  requiresSecondVouch:
    "communities.governanceLog.meta.field.requiresSecondVouch",
  autoFreezeOnReports:
    "communities.governanceLog.meta.field.autoFreezeOnReports",
  isFeatured: "communities.governanceLog.meta.field.isFeatured",
  name: "communities.governanceLog.meta.field.name",
  purpose: "communities.governanceLog.meta.field.purpose",
  type: "communities.governanceLog.meta.field.type",
  whoFor: "communities.governanceLog.meta.field.whoFor",
  tagline: "communities.governanceLog.meta.field.tagline",
  accessTier: "communities.governanceLog.meta.field.accessTier",
  rosterVisible: "communities.governanceLog.meta.field.rosterVisible",
  features: "communities.governanceLog.meta.field.features",
  rules: "communities.governanceLog.meta.field.rules",
  tags: "communities.governanceLog.meta.field.tags",
  coverImageUrl: "communities.governanceLog.meta.field.coverImageUrl",
};

/** `previousOwnerId` → `Previous owner id`. Last resort for a metadata key
 *  the frontend has no label for yet, so the raw machine name never reaches
 *  an admin as-is. */
export function humanizeMetadataKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
