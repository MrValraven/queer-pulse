import {
  elevatingCapabilities,
  requiredCapability,
  requiredRole,
} from "../../../app/authGate";
import type {
  PlatformLogPartyView,
  PlatformLogRowView,
} from "./api/platformLog.adapters";

export interface PlatformLogViewer {
  /** An admin, or the demo sandbox, which reaches every admin page. */
  isAdmin: boolean;
  /** Additive staff-role grants held on top of the moderator tier. */
  staffRoles: readonly string[];
  /** The member the log is filtered by, if any. */
  memberId: string | null;
}

/**
 * Mirrors the client route gate for someone who already reaches this page
 * (a moderator or an admin), so a moderator never follows a subject link that
 * bounces them back to the homepage.
 */
export function canViewerOpenRoute(
  route: string,
  viewer: PlatformLogViewer,
): boolean {
  if (viewer.isAdmin) return true;
  const pathname = route.split(/[?#]/)[0] || "/";
  const holdsAny = (capabilities: readonly string[]) =>
    capabilities.some((capability) => viewer.staffRoles.includes(capability));
  if (
    requiredRole(pathname) === "admin" &&
    !holdsAny(elevatingCapabilities(pathname))
  ) {
    return false;
  }
  const capability = requiredCapability(pathname);
  return !capability || viewer.staffRoles.includes(capability);
}

function partyForViewer(
  party: PlatformLogPartyView,
  memberId: string | null,
): PlatformLogPartyView {
  // The member already filtered by gains nothing from a filter button.
  return memberId && party.userId === memberId
    ? { ...party, isFilterable: false }
    : party;
}

function subjectForViewer(
  subject: PlatformLogRowView["subject"],
  viewer: PlatformLogViewer,
): PlatformLogRowView["subject"] {
  if (!subject?.to || canViewerOpenRoute(subject.to, viewer)) return subject;
  // A bare "View" with nowhere to go says nothing, so it is dropped.
  return subject.isFallback ? null : { ...subject, to: null };
}

/** Shapes a row for who is reading it: their access and the active filter. */
export function rowForViewer(
  row: PlatformLogRowView,
  viewer: PlatformLogViewer,
): PlatformLogRowView {
  return {
    ...row,
    actor: partyForViewer(row.actor, viewer.memberId),
    target: row.target ? partyForViewer(row.target, viewer.memberId) : null,
    subject: subjectForViewer(row.subject, viewer),
  };
}
