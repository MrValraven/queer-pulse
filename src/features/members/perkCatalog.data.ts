/**
 * Display strings for the server-authored perks ladder.
 *
 * The backend's `recognition.catalog.ts` is content in code, the same as the
 * badge catalogue: it emits a stable id per perk plus English `cat` / `title`
 * / `desc` and English footer copy. Those English strings used to render
 * straight onto a translated page, and the ladder was worse still: the row's
 * baseline capabilities and its claimable perks were flattened into one
 * untyped `string[]`, so nothing on the page could tell which sentence was
 * which. The fix follows `badgeCatalog.data.ts` and `levelLadder.data.ts`:
 * the wire carries the stable id, the frontend owns the words, and `t(...)`
 * resolves them at render so one response reads correctly in either language.
 *
 * Two different kinds of id land in this file and they are persisted very
 * differently:
 *
 *   - A `PERK_CATALOG` key (`vouch-access`, `invite-quota-level-4`,
 *     `invite-quota-level-5`) IS persisted, on
 *     `recognition_perk_claims.perk_key` under
 *     `UQ_recognition_perk_claims_user_perk`, and it is the path segment the
 *     claim endpoint takes. It must never be renamed.
 *   - A `BASE_PERKS_BY_LEVEL` id (`browse-directory` and friends) is new and
 *     reaches no table: a baseline capability is descriptive and can never be
 *     claimed. It still has to stay distinct from every catalogue key,
 *     because a ladder row lists both kinds together.
 *
 * Every lookup here returns null for an id it does not know, so the caller
 * falls back to the server's own English rather than rendering a blank or a
 * raw identifier.
 */

/** Footer copy owned by the frontend for one perk. Which fields matter
 *  depends on the footer variant the server sent for it. */
export interface PerkFooterCopyMeta {
  /** The quiet "you already have this" chip on an `active-auto` footer. */
  autoLabelKey?: string;
  /** The claim button's label on a `button` footer. */
  buttonLabelKey?: string;
  /** The toast shown after a successful claim. */
  toastKey?: string;
}

export interface PerkDisplayMeta {
  titleKey: string;
  descKey: string;
  categoryKey: string;
  footer?: PerkFooterCopyMeta;
}

export const PERK_DISPLAY_META: Record<string, PerkDisplayMeta> = {
  // Vouching is gated by `ActiveMemberGuard` alone, so this is a capability
  // every active member already holds rather than a locked tier (COM-15).
  // The copy has to keep saying that.
  "vouch-access": {
    titleKey: "members:perks.catalog.vouchAccess.title",
    descKey: "members:perks.catalog.vouchAccess.desc",
    categoryKey: "members:perks.category.community",
    footer: { autoLabelKey: "members:perks.catalog.vouchAccess.autoLabel" },
  },
  "invite-quota-level-4": {
    titleKey: "members:perks.catalog.inviteQuotaLevel4.title",
    descKey: "members:perks.catalog.inviteQuotaLevel4.desc",
    categoryKey: "members:perks.category.membership",
    footer: {
      buttonLabelKey: "members:perks.claim.higherAllowanceCta",
      toastKey: "members:perks.claim.higherAllowanceToast",
    },
  },
  "invite-quota-level-5": {
    titleKey: "members:perks.catalog.inviteQuotaLevel5.title",
    descKey: "members:perks.catalog.inviteQuotaLevel5.desc",
    categoryKey: "members:perks.category.membership",
    footer: {
      buttonLabelKey: "members:perks.claim.higherAllowanceCta",
      toastKey: "members:perks.claim.higherAllowanceToast",
    },
  },
};

/** Display text for a perk id, or null when this map has not caught up with
 *  the backend catalogue yet, so the caller renders the server's own English
 *  instead of nothing. */
export function perkDisplayMetaFor(perkKey: string): PerkDisplayMeta | null {
  return PERK_DISPLAY_META[perkKey] ?? null;
}

/**
 * The baseline capabilities a ladder row names. These describe what the
 * platform already lets every member do: nothing in the backend gates
 * messaging, saving, joining or hosting on a recognition level, and this copy
 * must never start implying one (SUS-04).
 */
export const BASE_PERK_LABEL_KEY: Record<string, string> = {
  "browse-directory": "members:perks.base.browseDirectory",
  "join-gatherings": "members:perks.base.joinGatherings",
  "direct-messages": "members:perks.base.directMessages",
  "save-articles": "members:perks.base.saveArticles",
  "join-communities": "members:perks.base.joinCommunities",
  "host-gathering": "members:perks.base.hostGathering",
};

/** The label key for one entry on a level's ladder row, whichever kind of id
 *  it is, or null so the caller falls back to the server's own English. */
export function perkLadderEntryLabelKeyFor(entryId: string): string | null {
  return (
    BASE_PERK_LABEL_KEY[entryId] ??
    perkDisplayMetaFor(entryId)?.titleKey ??
    null
  );
}

/** The perk categories the catalogue groups by. They arrive as display words
 *  rather than slugs (`cat: 'Membership'`), so the map is keyed on the exact
 *  backend spelling. Deliberately separate from the badge categories: a perk
 *  category and a badge category share a word by coincidence, and tying their
 *  Portuguese together for that would be a mistake. */
export const PERK_CATEGORY_LABEL_KEY: Record<string, string> = {
  Community: "members:perks.category.community",
  Membership: "members:perks.category.membership",
};

/** i18n key for a perk category label, or null for one this map does not
 *  know, so the caller falls back to the server's own word. */
export function perkCategoryLabelKeyFor(category: string): string | null {
  return PERK_CATEGORY_LABEL_KEY[category] ?? null;
}
