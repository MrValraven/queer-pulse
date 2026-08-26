import type { JoinRequestView } from "./api/useJoinRequests";

/**
 * A pending queue row for the bulk-triage suites. Only the fields the bulk
 * surfaces read carry meaning; the rest are neutral defaults, so a test asserts
 * on what it set rather than on fixture noise.
 */
export function makeJoinRequestRow(
  overrides: Partial<JoinRequestView> & Pick<JoinRequestView, "id" | "name">,
): JoinRequestView {
  return {
    initials: overrides.name.slice(0, 2).toUpperCase(),
    tone: "jade",
    email: `${overrides.id}@example.org`,
    city: "Lisbon",
    message: "I would like to join.",
    mutualMemberEmail: null,
    ageLine: "18+ confirmed",
    sourceLabel: "Homepage hero",
    appliedLine: "Applied 2 days ago",
    daysWaiting: 2,
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
    createdAt: new Date("2026-08-20T10:00:00.000Z").toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    declineReason: null,
    flagLabels: [],
    priorDeclineLine: null,
    referenceLine: null,
    referenceMemberSlug: null,
    status: "pending",
    assignedStaffId: null,
    dueAt: null,
    ...overrides,
  };
}
