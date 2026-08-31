import type { BadgeTone } from "../../shared/components/ui";
import {
  isCommunityGovernanceLogAction,
  type CommunityGovernanceLogAction,
} from "./api/communityGovernanceLog.api";

/**
 * Static chrome for the community-side governance trail: chip tone per action,
 * and the i18n keys that turn a raw server value into a readable label.
 *
 * The admin console keeps its own copy of this map
 * (`src/features/admin/adminCommunityGovernanceLog.data.ts`). Two panes, two
 * audiences, two catalogs: the community pane reads only the narrowed
 * `details` allowlist and covers actions the admin list never grew (bans, the
 * membership-card programme), so sharing one map would mean one of the two
 * quietly rendering rows written for the other.
 */

/** Chip colour per action: red for anything that takes something away, jade
 *  for anything that gives it back or offers help, violet for a handover,
 *  amber for a role move or a pause, plum for a settings edit or a reply. */
export const COMMUNITY_GOVERNANCE_ACTION_TONE: Record<
  CommunityGovernanceLogAction,
  BadgeTone
> = {
  role_changed: "amber",
  member_removed: "danger",
  member_banned: "danger",
  member_ban_proposed: "amber",
  member_ban_ratified: "danger",
  member_ban_declined: "jade",
  member_ban_hold_expired: "ghost",
  ban_lifted: "jade",
  ownership_transferred: "violet",
  owner_auto_promoted: "violet",
  frozen: "danger",
  unfrozen: "jade",
  archived: "danger",
  unarchived: "jade",
  settings_changed: "plum",
  card_program_enabled: "jade",
  card_program_disabled: "ghost",
  card_suspended: "amber",
  card_revoked: "danger",
  card_reinstated: "jade",
  card_replaced: "plum",
  support_offered: "jade",
  support_offer_answered: "plum",
};

/** The chip tone for a raw wire value. An action this client has not learned
 *  yet stays neutral rather than borrowing another action's colour. */
export function communityGovernanceActionTone(action: string): BadgeTone {
  return isCommunityGovernanceLogAction(action)
    ? COMMUNITY_GOVERNANCE_ACTION_TONE[action]
    : "ghost";
}

/**
 * `card_replaced` becomes `Card replaced`. The last resort for an action or a
 * metadata key the frontend has no label for yet, so a value the backend added
 * this morning reads as words rather than reaching a moderator as a raw enum.
 */
export function humanizeGovernanceKey(key: string): string {
  const spaced = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Roster roles a `role_changed` entry names. `co_owner` is included: the
 *  backend has issued it since `AddCommunityCoOwnerRole`. */
export const GOVERNANCE_ROLE_LABEL_KEYS: Record<string, string> = {
  owner: "communities:detail.modtools.history.role.owner",
  co_owner: "communities:detail.modtools.history.role.coOwner",
  mod: "communities:detail.modtools.history.role.mod",
  member: "communities:detail.modtools.history.role.member",
};

/**
 * The settings fields a `settings_changed` diff can name. Only the fields this
 * community's own PATCH can write reach this pane: the platform-side toggles
 * (`isFeatured`, `requiresSecondVouch`, `autoFreezeOnReports`) are stripped by
 * the backend allowlist and stay on the admin route. A field the frontend does
 * not know yet falls back to `humanizeGovernanceKey`.
 */
export const GOVERNANCE_FIELD_LABEL_KEYS: Record<string, string> = {
  name: "communities:detail.modtools.history.field.name",
  purpose: "communities:detail.modtools.history.field.purpose",
  type: "communities:detail.modtools.history.field.type",
  whoFor: "communities:detail.modtools.history.field.whoFor",
  tagline: "communities:detail.modtools.history.field.tagline",
  accessTier: "communities:detail.modtools.history.field.accessTier",
  rosterVisible: "communities:detail.modtools.history.field.rosterVisible",
  features: "communities:detail.modtools.history.field.features",
  rules: "communities:detail.modtools.history.field.rules",
  tags: "communities:detail.modtools.history.field.tags",
  coverImageUrl: "communities:detail.modtools.history.field.coverImageUrl",
};
