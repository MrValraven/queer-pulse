import type { EditableCommunityFields } from "../communities/api/communities.adapters";
import type { AccessTier } from "../communities/api/communities.api";

export interface CommunitySettings {
  name: string;
  description: string;
  membershipMode: "open" | "request" | "invite";
  rules: string;
}

/**
 * Seed the mod-panel Settings form from the community's authoritative editable
 * fields (the same `EditableCommunityFields` the edit modal uses — sourced from
 * the live detail DTO, or the mock view-models in demo). Previously this derived
 * a title-cased name from the slug and an always-empty description; seeding from
 * the real fields is what lets "Save" round-trip actual values.
 *
 * The 3-way membership selector collapses the 4 access tiers: `invite` and
 * `private` both show as "invite". The Settings tab therefore only sends a new
 * `accessTier` when the selection *changes* (so a private community isn't
 * silently flipped to invite on an unrelated save) — see `SettingsTab.save`.
 */
export function defaultSettings(
  editable: EditableCommunityFields,
): CommunitySettings {
  const tierToMode = (
    tier: AccessTier,
  ): CommunitySettings["membershipMode"] => {
    if (tier === "public") return "open";
    if (tier === "request") return "request";
    return "invite"; // 'invite' | 'private' → 'invite'
  };
  return {
    name: editable.name,
    description: editable.tagline,
    membershipMode: tierToMode(editable.accessTier),
    rules: editable.rules.join("\n"),
  };
}
