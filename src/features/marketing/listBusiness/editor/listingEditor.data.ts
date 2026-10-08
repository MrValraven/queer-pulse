import { ANCHOR } from "../listBusiness.data";
import type { ListingPricingMode } from "../listingMenu.data";
import type { ListingKind } from "../listingMobile.data";

/**
 * One section of the single-screen owner editor: the DOM id its jump link
 * scrolls to, the catalog key naming it, and the field anchors it owns.
 *
 * The anchors are the SAME stable ids `ANCHOR` already defines for the
 * "what's still needed" chips, so a section's outstanding count is derived
 * from the form's own `missing` list, so there is no second rulebook to keep
 * in step with it.
 */
export type ListingEditorSectionKey =
  | "basics"
  | "story"
  | "services"
  | "practical"
  | "accessibility"
  | "trading"
  | "photos"
  | "aboutYou"
  | "coManagers"
  | "permissions"
  | "history"
  | "dangerZone";

export interface ListingEditorSectionDefinition {
  key: ListingEditorSectionKey;
  id: string;
  labelKey: string;
  anchors: string[];
}

/**
 * Ordered for someone hunting one field: what the place IS first (name, category, area, price, one-liner),
 * then how it reads, then what it costs, then where and when to find it, then
 * who can get in, then whether it is trading and showing, then pictures, then
 * the person behind it, then the permissions that rarely change, then the
 * record of who changed what, and at the very end, for the owner alone, the
 * one action that cannot be taken back.
 */
export const LISTING_EDITOR_SECTIONS: ListingEditorSectionDefinition[] = [
  {
    key: "basics",
    id: "lb-editor-basics",
    labelKey: "marketing:listBusiness.wizard.pill.basics",
    anchors: [
      ANCHOR.online,
      ANCHOR.name,
      ANCHOR.cats,
      ANCHOR.adultTerms,
      ANCHOR.hood,
      ANCHOR.city,
      ANCHOR.whereYouWork,
      ANCHOR.badge,
      ANCHOR.price,
      ANCHOR.blurb,
    ],
  },
  {
    key: "story",
    id: "lb-editor-story",
    labelKey: "marketing:listBusiness.wizard.pill.story",
    anchors: [ANCHOR.tagline, ANCHOR.whatItIs],
  },
  {
    key: "services",
    id: "lb-editor-services",
    labelKey: "marketing:listBusiness.editor.section.services",
    anchors: [ANCHOR.services],
  },
  {
    key: "practical",
    id: "lb-editor-practical",
    labelKey: "marketing:listBusiness.wizard.pill.practical",
    anchors: [
      ANCHOR.meetingPoint,
      ANCHOR.byAppointment,
      ANCHOR.address,
      ANCHOR.hours,
      ANCHOR.hoursExceptions,
      ANCHOR.hasOnlineShop,
      ANCHOR.mainLink,
      ANCHOR.moreLinks,
      ANCHOR.fulfilment,
      ANCHOR.pickupNote,
      ANCHOR.shipsFrom,
      ANCHOR.payments,
      ANCHOR.sessionFormats,
      ANCHOR.registration,
      ANCHOR.replyNote,
      ANCHOR.social,
    ],
  },
  {
    key: "accessibility",
    id: "lb-editor-accessibility",
    labelKey: "marketing:listBusiness.editor.section.accessibility",
    // Every question has a real answer at all times ("not answered yet" is
    // one), so nothing here can ever be outstanding.
    anchors: [],
  },
  {
    key: "trading",
    id: "lb-editor-trading",
    labelKey: "marketing:listBusiness.editor.section.tradingAndVisibility",
    // The trading and visibility controls save themselves the moment they are
    // applied, so neither can ever be one of the fields the save bar is still
    // waiting on.
    anchors: [],
  },
  {
    key: "photos",
    id: "lb-editor-photos",
    labelKey: "marketing:listBusiness.wizard.pill.photos",
    anchors: [ANCHOR.photos],
  },
  {
    key: "aboutYou",
    id: "lb-editor-about-you",
    labelKey: "marketing:listBusiness.editor.section.aboutYou",
    anchors: [ANCHOR.rel, ANCHOR.ownerName, ANCHOR.ownerRole],
  },
  {
    key: "coManagers",
    id: "lb-editor-co-managers",
    labelKey: "marketing:listBusiness.editor.section.whoCanEdit",
    // Inviting and stepping down take effect the moment they are pressed, so
    // nothing here can ever be a field the save bar is still waiting on.
    anchors: [],
  },
  {
    key: "permissions",
    id: "lb-editor-permissions",
    labelKey: "marketing:listBusiness.editor.section.permissions",
    anchors: [ANCHOR.consent],
  },
  {
    key: "history",
    id: "lb-editor-history",
    labelKey: "marketing:listBusiness.editor.section.history",
    // A read-only record of past changes, so nothing here is ever a field the
    // save bar is waiting on.
    anchors: [],
  },
  {
    key: "dangerZone",
    id: "lb-editor-danger-zone",
    labelKey: "marketing:listBusiness.editor.section.dangerZone",
    // One button that opens its own confirmation, so nothing here is ever a
    // field the save bar is waiting on.
    anchors: [],
  },
];

/** Section ids in render order. Module-level so the scroll-spy observer can
 *  depend on a stable array identity. */
export const LISTING_EDITOR_SECTION_IDS = LISTING_EDITOR_SECTIONS.map(
  (section) => section.id,
);

/** The same definitions keyed by name, so each section renders by the name it
 *  is known by instead of an array index. */
export const LISTING_EDITOR_SECTION_BY_KEY = Object.fromEntries(
  LISTING_EDITOR_SECTIONS.map((section) => [section.key, section]),
) as Record<ListingEditorSectionKey, ListingEditorSectionDefinition>;

/**
 * The same sections as a CO-MANAGER meets them.
 *
 * Two blocks change shape rather than disappearing. "About you" holds only the
 * role shown on the listing, because the owner's own details are not a
 * co-manager's to see, so it is titled for what it actually contains and its
 * outstanding-field anchors shrink to that one field. "Permissions" becomes
 * read-only, so it can never be outstanding either. The danger zone is the one
 * block that does disappear: deleting a listing is the owner's alone, and the
 * API refuses a co-manager's `DELETE /listings/:ref`.
 *
 * Module-level, like the list above, so the jump nav and the scroll-spy both
 * keep a stable array identity across renders.
 */
const CO_MANAGER_SECTION_OVERRIDES: Partial<
  Record<ListingEditorSectionKey, Partial<ListingEditorSectionDefinition>>
> = {
  aboutYou: {
    labelKey: "marketing:listBusiness.editor.section.roleOnListing",
    anchors: [ANCHOR.ownerRole],
  },
  permissions: { anchors: [] },
};

const OWNER_ONLY_SECTION_KEYS: ReadonlySet<ListingEditorSectionKey> = new Set([
  "dangerZone",
]);

const CO_MANAGER_SECTION_DEFINITIONS: ListingEditorSectionDefinition[] =
  LISTING_EDITOR_SECTIONS.map((section) => ({
    ...section,
    ...CO_MANAGER_SECTION_OVERRIDES[section.key],
  }));

export const CO_MANAGER_EDITOR_SECTIONS: ListingEditorSectionDefinition[] =
  CO_MANAGER_SECTION_DEFINITIONS.filter(
    (section) => !OWNER_ONLY_SECTION_KEYS.has(section.key),
  );

/** Keyed from the UNFILTERED list, so every key the type promises is really
 *  there. Whether an owner-only block renders is decided where it renders. */
const CO_MANAGER_EDITOR_SECTION_BY_KEY = Object.fromEntries(
  CO_MANAGER_SECTION_DEFINITIONS.map((section) => [section.key, section]),
) as Record<ListingEditorSectionKey, ListingEditorSectionDefinition>;

/**
 * An online listing answers its own four accessibility questions
 * (`ONLINE_ACCESSIBILITY_QUESTIONS`), so no section leaves the page for it.
 * Kept as the one place a section could be hidden by kind.
 */
const ONLINE_HIDDEN_SECTION_KEYS: ReadonlySet<ListingEditorSectionKey> =
  new Set<ListingEditorSectionKey>();

function withoutOnlineHiddenSections(
  sections: ListingEditorSectionDefinition[],
): ListingEditorSectionDefinition[] {
  return sections.filter(
    (section) => !ONLINE_HIDDEN_SECTION_KEYS.has(section.key),
  );
}

/** The owner's and the co-manager's lists as an online-only listing shows
 *  them. Module-level for the same stable identity. */
const ONLINE_LISTING_EDITOR_SECTIONS = withoutOnlineHiddenSections(
  LISTING_EDITOR_SECTIONS,
);
const ONLINE_CO_MANAGER_EDITOR_SECTIONS = withoutOnlineHiddenSections(
  CO_MANAGER_EDITOR_SECTIONS,
);

/** Whether this section renders for a listing, online-only or not. */
export function isSectionShownForListing(
  sectionKey: ListingEditorSectionKey,
  isOnline: boolean,
): boolean {
  return !isOnline || !ONLINE_HIDDEN_SECTION_KEYS.has(sectionKey);
}

/**
 * The section list to render and to jump between, for this member's role and
 * for whether the listing is online only. Always one of four module-level
 * arrays, so the scroll-spy keeps a stable identity across renders.
 */
export function editorSectionsFor(
  isCoManagerView: boolean,
  isOnline = false,
): ListingEditorSectionDefinition[] {
  if (isCoManagerView) {
    return isOnline
      ? ONLINE_CO_MANAGER_EDITOR_SECTIONS
      : CO_MANAGER_EDITOR_SECTIONS;
  }
  return isOnline ? ONLINE_LISTING_EDITOR_SECTIONS : LISTING_EDITOR_SECTIONS;
}

/** The same definitions keyed by name, for this member's role. */
export function editorSectionByKeyFor(
  isCoManagerView: boolean,
): Record<ListingEditorSectionKey, ListingEditorSectionDefinition> {
  return isCoManagerView
    ? CO_MANAGER_EDITOR_SECTION_BY_KEY
    : LISTING_EDITOR_SECTION_BY_KEY;
}

const MENU_SECTION_LABEL_KEY = "marketing:listBusiness.editor.section.menu";
const SHOP_SECTION_LABEL_KEY = "marketing:listBusiness.editor.section.shop";
const PRACTICAL_ONLINE_LABEL_KEY =
  "marketing:listBusiness.editor.section.practicalOnline";
const ACCESSIBILITY_ONLINE_LABEL_KEY =
  "marketing:listBusiness.editor.section.accessibilityOnline";
const ACCESSIBILITY_MOBILE_LABEL_KEY =
  "marketing:listBusiness.editor.section.accessibilityMobile";

/** The pricing section as this listing shows it: titled "Menu" in menu mode
 *  and "In the shop" in shop mode. Same id and anchors in every mode, so jump
 *  links and missing badges hold. */
export function pricingSectionDefinition(
  section: ListingEditorSectionDefinition,
  pricingMode: ListingPricingMode,
): ListingEditorSectionDefinition {
  if (pricingMode === "menu") {
    return { ...section, labelKey: MENU_SECTION_LABEL_KEY };
  }
  if (pricingMode === "shop") {
    return { ...section, labelKey: SHOP_SECTION_LABEL_KEY };
  }
  return section;
}

/** The practical section as an online listing shows it: "How people buy
 *  from you". Same id and anchors, so jump links and counts hold. */
export function practicalSectionDefinition(
  section: ListingEditorSectionDefinition,
  isOnline: boolean,
): ListingEditorSectionDefinition {
  return isOnline
    ? { ...section, labelKey: PRACTICAL_ONLINE_LABEL_KEY }
    : section;
}

/** The accessibility section as an online listing shows it ("Online
 *  access") and as an out-and-about one shows it ("Joining in"). */
export function accessibilitySectionDefinition(
  section: ListingEditorSectionDefinition,
  kind: ListingKind,
): ListingEditorSectionDefinition {
  if (kind === "online") {
    return { ...section, labelKey: ACCESSIBILITY_ONLINE_LABEL_KEY };
  }
  if (kind === "mobile") {
    return { ...section, labelKey: ACCESSIBILITY_MOBILE_LABEL_KEY };
  }
  return section;
}

/** The nav's section list titled for the pricing mode and the listing's
 *  kind. Returns the same array when nothing is retitled, which keeps the
 *  scroll-spy's dependency stable. */
export function withListingKindLabels(
  sections: ListingEditorSectionDefinition[],
  pricingMode: ListingPricingMode,
  kind: ListingKind,
): ListingEditorSectionDefinition[] {
  if (pricingMode === "services" && kind === "place") return sections;
  const isOnline = kind === "online";
  return sections.map((section) => {
    if (section.key === "services") {
      return pricingSectionDefinition(section, pricingMode);
    }
    if (section.key === "practical") {
      return practicalSectionDefinition(section, isOnline);
    }
    if (section.key === "accessibility") {
      return accessibilitySectionDefinition(section, kind);
    }
    return section;
  });
}

/** The nav's section list with the pricing section titled for the mode.
 *  Returns the same array in services mode to keep the scroll-spy stable. */
export function withPricingModeLabel(
  sections: ListingEditorSectionDefinition[],
  pricingMode: ListingPricingMode,
): ListingEditorSectionDefinition[] {
  if (pricingMode === "services") return sections;
  return sections.map((section) =>
    section.key === "services"
      ? pricingSectionDefinition(section, pricingMode)
      : section,
  );
}
