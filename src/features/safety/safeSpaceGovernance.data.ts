import type {
  AdminSafeSpaceFlagDTO,
  AdminSafeSpaceNominationDTO,
  SafeSpaceAuditDTO,
  SafeSpaceBadgeStateDTO,
  SafeSpaceFlagReason,
  SafeSpaceReReviewDueDTO,
} from "./api/safeSpaceGovernance.api";

/**
 * Demo-mode fixtures for the safe-space governance surfaces. These stand in
 * for the moderator-guarded endpoints so the standalone prototype still shows
 * a working queue, and they are never read by a live code path.
 *
 * Every fixture is invented. No real member, listing or flagger appears here,
 * and the flag fixtures carry a placeholder `flaggerId` so nothing in the demo
 * can be mistaken for a real person having raised something.
 */

const HOUR_IN_MS = 60 * 60 * 1000;

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR_IN_MS).toISOString();
}

function hoursAhead(hours: number): string {
  return new Date(Date.now() + hours * HOUR_IN_MS).toISOString();
}

/** The flag reasons, in the order the member-facing picker offers them. */
export const SAFE_SPACE_FLAG_REASONS: SafeSpaceFlagReason[] = [
  "not_safe",
  "discrimination",
  "staff_conduct",
  "accessibility",
  "closed_or_changed",
  "other",
];

/** Demo badge state: a fully verified space, nothing outstanding. */
export const DEMO_BADGE_STATE: SafeSpaceBadgeStateDTO = {
  listingId: "demo-listing-1",
  slug: "demo-space",
  state: "verified",
  tier: 2,
  verifier: "Review team, 3 member visits",
  badgeAwardedAt: "2026-02-14",
  reReviewDueAt: "2027-02-14T00:00:00.000Z",
  isDueForReReview: false,
  isUnderReview: false,
  suspendedAt: null,
  suspensionReason: null,
  visits: {
    independentVisitCount: 4,
    requiredVisitCount: 3,
    hasMetVisitBar: true,
  },
  flagThreshold: 3,
  viewerHasFlagged: false,
};

export const DEMO_ADMIN_NOMINATIONS: AdminSafeSpaceNominationDTO[] = [
  {
    id: "demo-nomination-1",
    placeName: "Casa Amarela",
    address: "Rua da Rosa, Bairro Alto",
    placeType: "Café",
    listingRef: null,
    reason:
      "Staff stepped in when someone was being harassed at the next table. It felt like they had done it before.",
    status: "pending",
    createdAt: hoursAgo(61),
    receivedAt: hoursAgo(61),
    acknowledgementDueAt: hoursAgo(13),
    acknowledgedAt: null,
    decidedAt: null,
    decisionReason: null,
    awardedTier: null,
    nominatorId: "demo-member-1",
    acknowledgedBy: null,
    assignedAt: null,
    assignedBy: null,
    assignmentNote: null,
    decidedBy: null,
    reopenedAt: null,
    listingId: null,
    ageHours: 61,
    acknowledgementWindowHours: 48,
    hasBreachedAcknowledgement: true,
    wasAcknowledgedLate: false,
    visits: null,
    listing: null,
  },
  {
    id: "demo-nomination-2",
    placeName: "Livraria Terceiro Piso",
    address: "Praça das Flores",
    placeType: "Bookshop",
    listingRef: "demo-listing-9",
    reason: "Gender-neutral bathroom, and the reading nights are trans-led.",
    status: "in_review",
    createdAt: hoursAgo(30),
    receivedAt: hoursAgo(30),
    acknowledgementDueAt: hoursAhead(18),
    acknowledgedAt: hoursAgo(26),
    decidedAt: null,
    decisionReason: null,
    awardedTier: null,
    nominatorId: "demo-member-2",
    acknowledgedBy: "demo-moderator-1",
    assignedAt: hoursAgo(24),
    assignedBy: "demo-moderator-1",
    assignmentNote: "Please check step-free access and the bathroom signage.",
    decidedBy: null,
    reopenedAt: null,
    listingId: "demo-listing-9",
    ageHours: 30,
    acknowledgementWindowHours: 48,
    hasBreachedAcknowledgement: false,
    wasAcknowledgedLate: false,
    visits: {
      independentVisitCount: 2,
      requiredVisitCount: 3,
      hasMetVisitBar: false,
      notIndependentVouchCount: 1,
    },
    listing: {
      id: "demo-listing-9",
      ref: "demo-listing-9",
      slug: "livraria-terceiro-piso",
      name: "Livraria Terceiro Piso",
      safeSpaceStatus: "none",
      isBadgeSuspended: false,
      badgeAwardedAt: null,
      reReviewDueAt: null,
      isDueForReReview: false,
      openFlagCount: 0,
    },
  },
  {
    id: "demo-nomination-3",
    placeName: "Clube Sete",
    address: "Cais do Sodré",
    placeType: "Bar",
    listingRef: "demo-listing-4",
    reason: "Quiet room upstairs, door staff who know what they are doing.",
    status: "approved",
    createdAt: hoursAgo(720),
    receivedAt: hoursAgo(720),
    acknowledgementDueAt: hoursAgo(672),
    acknowledgedAt: hoursAgo(710),
    decidedAt: hoursAgo(200),
    decisionReason:
      "Four independent visits, all describing the same care at the door. Tier 2 for now, with the quiet room noted.",
    awardedTier: 2,
    nominatorId: "demo-member-3",
    acknowledgedBy: "demo-moderator-2",
    assignedAt: hoursAgo(700),
    assignedBy: "demo-moderator-2",
    assignmentNote: null,
    decidedBy: "demo-moderator-1",
    reopenedAt: null,
    listingId: "demo-listing-4",
    ageHours: 720,
    acknowledgementWindowHours: 48,
    hasBreachedAcknowledgement: false,
    wasAcknowledgedLate: false,
    visits: {
      independentVisitCount: 4,
      requiredVisitCount: 3,
      hasMetVisitBar: true,
      notIndependentVouchCount: 1,
    },
    listing: {
      id: "demo-listing-4",
      ref: "demo-listing-4",
      slug: "clube-sete",
      name: "Clube Sete",
      safeSpaceStatus: "verified",
      isBadgeSuspended: false,
      badgeAwardedAt: "2026-02-14",
      reReviewDueAt: "2027-02-14T00:00:00.000Z",
      isDueForReReview: false,
      openFlagCount: 1,
    },
  },
];

export const DEMO_NOMINATION_AUDIT: SafeSpaceAuditDTO[] = [
  {
    id: "demo-audit-3",
    subjectType: "nomination",
    subjectId: "demo-nomination-2",
    listingId: "demo-listing-9",
    action: "nomination_assigned",
    actorId: "demo-moderator-1",
    reason: "Please check step-free access and the bathroom signage.",
    metadata: { listingRef: "demo-listing-9" },
    createdAt: hoursAgo(24),
  },
  {
    id: "demo-audit-2",
    subjectType: "nomination",
    subjectId: "demo-nomination-2",
    listingId: null,
    action: "nomination_acknowledged",
    actorId: "demo-moderator-1",
    reason: null,
    metadata: { ageHours: 4 },
    createdAt: hoursAgo(26),
  },
];

export const DEMO_ADMIN_FLAGS: AdminSafeSpaceFlagDTO[] = [
  {
    id: "demo-flag-1",
    listingId: "demo-listing-4",
    listingSlug: "clube-sete",
    listingName: "Clube Sete",
    flaggerId: "demo-flagger-1",
    reasonCode: "staff_conduct",
    detail:
      "New door staff since the summer. They asked a friend for a second form of ID and nobody else in the queue.",
    state: "open",
    createdAt: hoursAgo(9),
    withdrawnAt: null,
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
    resolutionNote: null,
  },
  {
    id: "demo-flag-2",
    listingId: "demo-listing-12",
    listingSlug: "bar-do-largo",
    listingName: "Bar do Largo",
    flaggerId: "demo-flagger-2",
    reasonCode: "accessibility",
    detail:
      "The ramp at the side entrance has been blocked by crates for weeks.",
    state: "open",
    createdAt: hoursAgo(52),
    withdrawnAt: null,
    resolvedAt: null,
    resolvedBy: null,
    resolution: null,
    resolutionNote: null,
  },
  {
    id: "demo-flag-3",
    listingId: "demo-listing-12",
    listingSlug: "bar-do-largo",
    listingName: "Bar do Largo",
    flaggerId: "demo-flagger-3",
    reasonCode: "closed_or_changed",
    detail: "Under new ownership since June.",
    state: "resolved",
    createdAt: hoursAgo(140),
    withdrawnAt: null,
    resolvedAt: hoursAgo(100),
    resolvedBy: "demo-moderator-1",
    resolution: "upheld",
    resolutionNote: "Confirmed. Badge suspended pending a fresh set of visits.",
  },
];

export const DEMO_RE_REVIEW_DUE: SafeSpaceReReviewDueDTO[] = [
  {
    listingId: "demo-listing-12",
    ref: "demo-listing-12",
    slug: "bar-do-largo",
    name: "Bar do Largo",
    tier: 1,
    badgeAwardedAt: "2025-03-02",
    reReviewDueAt: "2026-03-02T00:00:00.000Z",
    daysOverdue: 176,
    isBadgeSuspended: true,
    openFlagCount: 1,
  },
  {
    listingId: "demo-listing-7",
    ref: "demo-listing-7",
    slug: "cafe-graca",
    name: "Café Graça",
    tier: 2,
    badgeAwardedAt: "2025-07-19",
    reReviewDueAt: "2026-07-19T00:00:00.000Z",
    daysOverdue: 37,
    isBadgeSuspended: false,
    openFlagCount: 0,
  },
];
