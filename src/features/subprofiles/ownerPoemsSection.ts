import { SECTION_META, sectionsForKind } from "./subprofile-kinds";
import type { SubprofileSectionView } from "./api/subprofiles.adapters";
import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";

/**
 * The kinds whose owner sees an empty events section before adding the
 * first event, so they can see where their events will go: the event
 * producer's `events` and the promoter's `nights`, both on the Poster skin.
 */
const OWNER_EMPTY_EVENT_SECTION: Partial<
  Record<SubprofileKind, SubprofileSection>
> = {
  event_producer: "events",
  promoter: "nights",
};

/**
 * The public view drops empty sections, so an owner whose kind has a section
 * with nothing in it yet would see no trace of it. This puts that section back
 * empty, at its place in the kind's section order, so the page can show the
 * owner where those items will go. Sections are returned unchanged for a kind
 * without that section or when the section is already there.
 */
export function withEmptyOwnerSection(
  sections: SubprofileSectionView[],
  kind: SubprofileKind,
  sectionName: SubprofileSection,
): SubprofileSectionView[] {
  const kindSections = sectionsForKind(kind);
  const hasSection = sections.some(
    (section) => section.section === sectionName,
  );
  if (!kindSections.includes(sectionName) || hasSection) return sections;
  const meta = SECTION_META[sectionName];
  const emptySection: SubprofileSectionView = {
    section: sectionName,
    labelKey: meta.labelKey,
    icon: meta.icon,
    fields: meta.fields,
    items: [],
  };
  const sectionOrder = kindSections.indexOf(sectionName);
  const insertAt = sections.findIndex(
    (section) => kindSections.indexOf(section.section) > sectionOrder,
  );
  if (insertAt === -1) return [...sections, emptySection];
  return [
    ...sections.slice(0, insertAt),
    emptySection,
    ...sections.slice(insertAt),
  ];
}

/** The owner's empty poems section, for a kind with poems. */
export function withEmptyPoemsSection(
  sections: SubprofileSectionView[],
  kind: SubprofileKind,
): SubprofileSectionView[] {
  return withEmptyOwnerSection(sections, kind, "poems");
}

/** The section an owner of this kind sees empty before the first event, or
 *  null for a kind without one. */
export function ownerEmptyEventSection(
  kind: SubprofileKind,
): SubprofileSection | null {
  return OWNER_EMPTY_EVENT_SECTION[kind] ?? null;
}

/** Every section an owner sees before it has items: poems for a kind with
 *  poems, and the events (or nights) section for an event producer or a
 *  promoter. */
export function withOwnerEmptySections(
  sections: SubprofileSectionView[],
  kind: SubprofileKind,
): SubprofileSectionView[] {
  const withPoems = withEmptyPoemsSection(sections, kind);
  const eventSection = ownerEmptyEventSection(kind);
  return eventSection
    ? withEmptyOwnerSection(withPoems, kind, eventSection)
    : withPoems;
}
