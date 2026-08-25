import { ANCHOR } from "../listBusiness.data";

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
  | "permissions";

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
 * the person behind it, and last the permissions that rarely change.
 */
export const LISTING_EDITOR_SECTIONS: ListingEditorSectionDefinition[] = [
  {
    key: "basics",
    id: "lb-editor-basics",
    labelKey: "marketing:listBusiness.wizard.pill.basics",
    anchors: [
      ANCHOR.name,
      ANCHOR.cats,
      ANCHOR.hood,
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
      ANCHOR.address,
      ANCHOR.hours,
      ANCHOR.hoursExceptions,
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
    anchors: [
      ANCHOR.rel,
      ANCHOR.ownerName,
      ANCHOR.ownerRole,
      ANCHOR.contactEmail,
    ],
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
 * read-only, so it can never be outstanding either.
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

export const CO_MANAGER_EDITOR_SECTIONS: ListingEditorSectionDefinition[] =
  LISTING_EDITOR_SECTIONS.map((section) => ({
    ...section,
    ...CO_MANAGER_SECTION_OVERRIDES[section.key],
  }));

const CO_MANAGER_EDITOR_SECTION_BY_KEY = Object.fromEntries(
  CO_MANAGER_EDITOR_SECTIONS.map((section) => [section.key, section]),
) as Record<ListingEditorSectionKey, ListingEditorSectionDefinition>;

/** The section list to render and to jump between, for this member's role. */
export function editorSectionsFor(
  isCoManagerView: boolean,
): ListingEditorSectionDefinition[] {
  return isCoManagerView ? CO_MANAGER_EDITOR_SECTIONS : LISTING_EDITOR_SECTIONS;
}

/** The same definitions keyed by name, for this member's role. */
export function editorSectionByKeyFor(
  isCoManagerView: boolean,
): Record<ListingEditorSectionKey, ListingEditorSectionDefinition> {
  return isCoManagerView
    ? CO_MANAGER_EDITOR_SECTION_BY_KEY
    : LISTING_EDITOR_SECTION_BY_KEY;
}
