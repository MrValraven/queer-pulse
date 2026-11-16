import { foldForSearch } from "../../../shared/lib/foldForSearch";
import { currentUser } from "../../members/data/demoCurrentUser";
import {
  LEAD_STAFF_PREVIEW_LIMIT,
  LEAD_STAFF_SEARCH_LIMIT,
  type LeadStaffSummaryDTO,
} from "./api/leads.types";
import {
  DEMO_LEAD_FORMER_STAFF,
  DEMO_LEAD_STAFF,
  DEMO_LEAD_VIEWER_ID,
  type DemoLeadStaffSeed,
} from "./leadsDemo.data";
import { normalizeLeadSearchTerm } from "./leadsDemoRules";

// The demo staff as the leads routes read them (contract 3, 5.1 and 8.4):
// the viewer and the eligible staff can be put in charge, the former staff
// only show up in history. `leadsDemoStore` asks here for summaries, for
// who may be assigned, and for the picker's search.

/** Plain text order, the order Postgres `ORDER BY` gives ids and names. */
const compareText = (first: string, second: string): number =>
  first < second ? -1 : first > second ? 1 : 0;

/** The viewer's own summary: the demo member, with the viewer id. */
export function demoViewerStaffSummary(): LeadStaffSummaryDTO {
  return {
    id: DEMO_LEAD_VIEWER_ID,
    slug: currentUser.slug,
    displayName: `${currentUser.first} ${currentUser.last}`,
    avatarUrl: currentUser.photo ?? null,
    avatarCrop: null,
  };
}

const toStaffSummary = (person: DemoLeadStaffSeed): LeadStaffSummaryDTO => ({
  id: person.id,
  slug: person.slug,
  displayName: person.displayName,
  avatarUrl: person.avatarUrl,
  avatarCrop: null,
});

const findSeed = (
  people: readonly DemoLeadStaffSeed[],
  userId: string,
): DemoLeadStaffSeed | undefined =>
  people.find((person) => person.id === userId);

/** The summary of the viewer, a staff member or a former one; null for an
 *  id no demo account has. */
export function demoStaffSummaryOf(userId: string): LeadStaffSummaryDTO | null {
  if (userId === DEMO_LEAD_VIEWER_ID) return demoViewerStaffSummary();
  const person =
    findSeed(DEMO_LEAD_STAFF, userId) ??
    findSeed(DEMO_LEAD_FORMER_STAFF, userId);
  return person ? toStaffSummary(person) : null;
}

/** Whether a person may be put in charge: the viewer and the staff may,
 *  former staff lack Leads access, any other id has no account. */
export function demoStaffEligibilityOf(
  userId: string,
): "eligible" | "not_found" | "no_access" {
  if (userId === DEMO_LEAD_VIEWER_ID || findSeed(DEMO_LEAD_STAFF, userId)) {
    return "eligible";
  }
  if (findSeed(DEMO_LEAD_FORMER_STAFF, userId)) return "no_access";
  return "not_found";
}

interface StaffSearchRow {
  summary: LeadStaffSummaryDTO;
  firstName: string;
  lastName: string;
}

/** A seeded name split on its first space into first and last name. */
function rowOfSeed(person: DemoLeadStaffSeed): StaffSearchRow {
  const spaceIndex = person.displayName.indexOf(" ");
  const hasLastName = spaceIndex !== -1;
  return {
    summary: toStaffSummary(person),
    firstName: hasLastName
      ? person.displayName.slice(0, spaceIndex)
      : person.displayName,
    lastName: hasLastName ? person.displayName.slice(spaceIndex + 1) : "",
  };
}

/** Everyone the picker can list: the viewer, then the eligible staff. */
const eligibleRows = (): StaffSearchRow[] => [
  {
    summary: demoViewerStaffSummary(),
    firstName: currentUser.first,
    lastName: currentUser.last,
  },
  ...DEMO_LEAD_STAFF.map(rowOfSeed),
];

/** By lower-cased first name, then last name, then id. */
const byName = (first: StaffSearchRow, second: StaffSearchRow): number =>
  compareText(first.firstName.toLowerCase(), second.firstName.toLowerCase()) ||
  compareText(first.lastName.toLowerCase(), second.lastName.toLowerCase()) ||
  compareText(first.summary.id, second.summary.id);

/** `GET /admin/leads/staff?q=` over the demo staff. A blank term previews
 *  the viewer then the others by name; any other term matches first name,
 *  last name and slug with folded accents, by name. */
export function searchDemoStaff(query: string): LeadStaffSummaryDTO[] {
  const term = foldForSearch(normalizeLeadSearchTerm(query));
  const rows = eligibleRows();
  if (term === "") {
    const isViewer = (row: StaffSearchRow) =>
      row.summary.id === DEMO_LEAD_VIEWER_ID;
    return rows
      .sort(
        (first, second) =>
          Number(!isViewer(first)) - Number(!isViewer(second)) ||
          byName(first, second),
      )
      .slice(0, LEAD_STAFF_PREVIEW_LIMIT)
      .map((row) => row.summary);
  }
  return rows
    .filter((row) =>
      foldForSearch(
        [row.firstName, row.lastName, row.summary.slug].join(" "),
      ).includes(term),
    )
    .sort(byName)
    .slice(0, LEAD_STAFF_SEARCH_LIMIT)
    .map((row) => row.summary);
}
