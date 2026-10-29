import {
  ANCHOR,
  type MissingField,
} from "../marketing/listBusiness/listBusiness.data";
import {
  isSectionShownForListing,
  LISTING_EDITOR_SECTIONS,
  type ListingEditorSectionDefinition,
  type ListingEditorSectionKey,
} from "../marketing/listBusiness/editor/listingEditor.data";

/**
 * The sections of the owner's single-screen editor that an admin editing a
 * platform-held listing meets: everything about the business itself.
 *
 * The rest belong to whoever ends up holding the listing. "About you" and
 * "Permissions" are the holder's own statements, which the admin API redacts
 * on the way out and refuses on the way in. "Who can edit", "Team" and
 * "Trading & visibility" call owner and team endpoints an admin is answered
 * 404 by. "History" reads `GET /listings/:ref/history`, which is gated to the
 * listing's owner or a co-manager, and a listing the platform holds has
 * neither. The Danger zone is the owner's delete.
 */
export type AdminListingEditorSectionKey = Extract<
  ListingEditorSectionKey,
  "basics" | "story" | "services" | "practical" | "accessibility" | "photos"
>;

const ADMIN_SECTION_KEYS: ReadonlySet<ListingEditorSectionKey> =
  new Set<AdminListingEditorSectionKey>([
    "basics",
    "story",
    "services",
    "practical",
    "accessibility",
    "photos",
  ]);

/** The owner's definitions, in the owner's order, minus the holder's own
 *  sections. Module-level so the jump nav and the scroll-spy keep a stable
 *  array identity across renders. */
const ADMIN_EDITOR_SECTIONS: ListingEditorSectionDefinition[] =
  LISTING_EDITOR_SECTIONS.filter((section) =>
    ADMIN_SECTION_KEYS.has(section.key),
  );

/** The same list as an online-only listing renders it. Today that is every
 *  section; it goes through `isSectionShownForListing` so a section the owner
 *  editor hides by kind leaves the admin page too. */
const ONLINE_ADMIN_EDITOR_SECTIONS: ListingEditorSectionDefinition[] =
  ADMIN_EDITOR_SECTIONS.filter((section) =>
    isSectionShownForListing(section.key, true),
  );

const ADMIN_EDITOR_SECTION_IDS = ADMIN_EDITOR_SECTIONS.map(
  (section) => section.id,
);
const ONLINE_ADMIN_EDITOR_SECTION_IDS = ONLINE_ADMIN_EDITOR_SECTIONS.map(
  (section) => section.id,
);

/** The admin sections keyed by name, so each renders by the name it is known
 *  by whatever its position in the list. */
export const ADMIN_EDITOR_SECTION_BY_KEY = Object.fromEntries(
  ADMIN_EDITOR_SECTIONS.map((section) => [section.key, section]),
) as Record<AdminListingEditorSectionKey, ListingEditorSectionDefinition>;

/** The section list to render and jump between, plus the ids the scroll-spy
 *  observes. Always one of two module-level pairs, so the spy only
 *  re-registers when the online answer actually changes. */
export function adminEditorSectionsFor(isOnline: boolean): {
  sections: ListingEditorSectionDefinition[];
  sectionIds: string[];
} {
  return isOnline
    ? {
        sections: ONLINE_ADMIN_EDITOR_SECTIONS,
        sectionIds: ONLINE_ADMIN_EDITOR_SECTION_IDS,
      }
    : { sections: ADMIN_EDITOR_SECTIONS, sectionIds: ADMIN_EDITOR_SECTION_IDS };
}

/** No team requests wait on a listing nobody holds, so the jump nav carries
 *  no attention pills. Module-level for a stable identity. */
export const NO_ADMIN_SECTION_BADGES: Partial<
  Record<ListingEditorSectionKey, number>
> = {};

/**
 * Field anchors that live only in the sections this page leaves out, plus
 * the affirming baseline, which no editor section renders. The shared rules
 * already skip every one of them for a staff-authored draft on the staff
 * path; they are named here so a later change to those rules can never hold
 * the admin's Save back on an input that is not on the page.
 */
const ADMIN_HIDDEN_FIELD_ANCHORS: ReadonlySet<string> = new Set([
  ...LISTING_EDITOR_SECTIONS.filter(
    (section) => !ADMIN_SECTION_KEYS.has(section.key),
  ).flatMap((section) => section.anchors),
  ANCHOR.affirmingBaseline,
]);

/** The outstanding fields an admin can actually fill in on this page. */
export function withoutAdminHiddenFields(
  missing: MissingField[],
): MissingField[] {
  return missing.filter(
    (field) => !ADMIN_HIDDEN_FIELD_ANCHORS.has(field.anchor),
  );
}
