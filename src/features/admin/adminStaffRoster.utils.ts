import type { AdminStaffRosterRowDTO } from "./api/adminStaffRoster.api";
import {
  STAFF_ROLES,
  type StaffRoleId,
  type StaffRoleMeta,
} from "./staffRoles.registry";

/** The account tiers the roster groups by, in the order the page shows them. */
export type StaffTier = AdminStaffRosterRowDTO["platformRole"];
export const STAFF_TIER_ORDER: StaffTier[] = ["admin", "moderator", "member"];

/** The tier control's values: every tier, or one of them. */
export type StaffTierFilter = "all" | StaffTier;

export interface StaffRosterFilters {
  search: string;
  tier: StaffTierFilter;
  grant: StaffRoleId | null;
}

export const EMPTY_STAFF_FILTERS: StaffRosterFilters = {
  search: "",
  tier: "all",
  grant: null,
};

export function hasActiveStaffFilters(filters: StaffRosterFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.tier !== "all" ||
    filters.grant !== null
  );
}

/** Lowercased and stripped of accents, so "joao" finds "João". */
export function normaliseSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function staffFullName(staffMember: AdminStaffRosterRowDTO): string {
  return `${staffMember.firstName} ${staffMember.lastName}`.trim();
}

export function staffInitials(staffMember: AdminStaffRosterRowDTO): string {
  const initials =
    staffMember.firstName.charAt(0) + staffMember.lastName.charAt(0);
  return initials.toUpperCase() || "?";
}

function matchesSearch(
  staffMember: AdminStaffRosterRowDTO,
  normalisedQuery: string,
): boolean {
  if (normalisedQuery === "") return true;
  // A leading "@" reads as a handle search; the haystack carries both.
  const query = normalisedQuery.replace(/^@/, "");
  const haystack = normaliseSearchText(
    `${staffFullName(staffMember)} ${staffMember.slug}`,
  );
  return haystack.includes(query);
}

export function filterStaffRows(
  rows: AdminStaffRosterRowDTO[],
  filters: StaffRosterFilters,
): AdminStaffRosterRowDTO[] {
  const normalisedQuery = normaliseSearchText(filters.search);
  return rows.filter(
    (staffMember) =>
      (filters.tier === "all" || staffMember.platformRole === filters.tier) &&
      (filters.grant === null ||
        staffMember.grants.some((grant) => grant.role === filters.grant)) &&
      matchesSearch(staffMember, normalisedQuery),
  );
}

export interface StaffRosterGroup {
  tier: StaffTier;
  rows: AdminStaffRosterRowDTO[];
}

/** Rows split by tier in page order. Empty tiers are left out. */
export function groupStaffRows(
  rows: AdminStaffRosterRowDTO[],
): StaffRosterGroup[] {
  return STAFF_TIER_ORDER.map((tier) => ({
    tier,
    rows: rows.filter((staffMember) => staffMember.platformRole === tier),
  })).filter((group) => group.rows.length > 0);
}

export interface StaffGrantCoverage {
  role: StaffRoleMeta;
  /** Active members holding this grant: the people who can act on it today. */
  activeHolders: AdminStaffRosterRowDTO[];
  /** Holders whose account is suspended or deactivated. */
  inactiveHolderCount: number;
}

/** One entry per registry grant, in registry order. */
export function computeGrantCoverage(
  rows: AdminStaffRosterRowDTO[],
): StaffGrantCoverage[] {
  return STAFF_ROLES.map((role) => {
    const holders = rows.filter((staffMember) =>
      staffMember.grants.some((grant) => grant.role === role.id),
    );
    const activeHolders = holders.filter(
      (staffMember) => staffMember.status === "active",
    );
    return {
      role,
      activeHolders,
      inactiveHolderCount: holders.length - activeHolders.length,
    };
  });
}

export interface StaffRosterSummary {
  adminCount: number;
  moderatorCount: number;
  grantHolderCount: number;
  uncoveredGrantCount: number;
}

export function summariseStaffRoster(
  rows: AdminStaffRosterRowDTO[],
  coverage: StaffGrantCoverage[],
): StaffRosterSummary {
  return {
    adminCount: rows.filter(
      (staffMember) => staffMember.platformRole === "admin",
    ).length,
    moderatorCount: rows.filter(
      (staffMember) => staffMember.platformRole === "moderator",
    ).length,
    grantHolderCount: rows.filter(
      (staffMember) =>
        staffMember.platformRole === "member" && staffMember.grants.length > 0,
    ).length,
    uncoveredGrantCount: coverage.filter(
      (entry) => entry.activeHolders.length === 0,
    ).length,
  };
}

/** The registry entry for a grant id, for its label and description keys. */
export function staffRoleMeta(roleId: StaffRoleId): StaffRoleMeta | undefined {
  return STAFF_ROLES.find((role) => role.id === roleId);
}

/** A parsed ISO date, or `null` when the string does not parse. */
export function parseIsoDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
