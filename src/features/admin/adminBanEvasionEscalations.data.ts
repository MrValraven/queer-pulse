import type { BanEvasionEscalationDTO } from "./api/adminBanEvasionEscalations.api";

/**
 * Demo-mode ban-evasion escalations, so the staff queue renders with no
 * backend. Mirrors {@link BanEvasionEscalationDTO} exactly.
 *
 * Fabricated, and it must never surface as platform truth: the live endpoint is
 * staff-only and 403s otherwise, so demo mode reads this instead of the network
 * rather than showing an empty queue.
 *
 * The open rows are deliberately the three shapes the card has to render: an
 * applicant with a real assessment, an applicant whose account has been erased
 * (so `subject` and `assessment` are both null), and an applicant the check
 * came back clear on. The resolved row carries the staff note that never leaves
 * this console.
 */
export const ADMIN_BAN_EVASION_ESCALATIONS_DEMO: BanEvasionEscalationDTO[] = [
  {
    id: "demo-escalation-1",
    status: "open",
    createdAt: "2026-08-29T14:05:00.000Z",
    note: "They answered the intake questions almost word for word like someone we removed in April. Can you check across the platform?",
    communitySlug: "porto-queer-readers",
    communityName: "Porto Queer Readers",
    joinRequestId: "jr-flagged-demo",
    subject: {
      slug: "kai-oliveira",
      firstName: "Kai",
      lastName: "Oliveira",
      avatarUrl: null,
    },
    raisedBy: {
      slug: "ines-costa",
      firstName: "Inês",
      lastName: "Costa",
      avatarUrl: null,
    },
    assessment: {
      subjectId: "jr-flagged-demo",
      tier: "medium",
      score: 50,
      signals: [
        {
          kind: "intake_contact_match",
          removalKind: "platform_ban",
          removedAt: "2026-05-14T10:00:00.000Z",
          removedAccountName: null,
          removedAccountSlug: null,
          communityName: null,
        },
        {
          kind: "reference_of_removed_account",
          removalKind: "community_ban",
          removedAt: "2026-04-02T16:30:00.000Z",
          removedAccountName: "Sam Ferreira",
          removedAccountSlug: "sam-ferreira",
          communityName: "Porto Queer Readers",
        },
      ],
    },
    resolvedAt: null,
    resolutionNote: null,
    resolvedBy: null,
  },
  {
    id: "demo-escalation-2",
    status: "open",
    createdAt: "2026-08-27T09:40:00.000Z",
    note: null,
    communitySlug: "lisboa-trans-social",
    communityName: "Lisboa Trans Social",
    joinRequestId: "jr-erased-demo",
    // The applicant erased their account after escalating. Nothing is left to
    // correlate, so the assessment is null rather than clear.
    subject: null,
    raisedBy: {
      slug: "nuno-pires",
      firstName: "Nuno",
      lastName: "Pires",
      avatarUrl: null,
    },
    assessment: null,
    resolvedAt: null,
    resolutionNote: null,
    resolvedBy: null,
  },
  {
    id: "demo-escalation-3",
    status: "open",
    createdAt: "2026-08-25T18:12:00.000Z",
    note: "Long shot, but the writing style felt familiar.",
    communitySlug: "algarve-queer-hikes",
    communityName: "Algarve Queer Hikes",
    joinRequestId: "jr-clear-demo",
    subject: {
      slug: "mariana-lopes",
      firstName: "Mariana",
      lastName: "Lopes",
      avatarUrl: null,
    },
    raisedBy: {
      slug: "ines-costa",
      firstName: "Inês",
      lastName: "Costa",
      avatarUrl: null,
    },
    // Checked, and nothing correlated. A stated result, never an absence.
    assessment: {
      subjectId: "jr-clear-demo",
      tier: "none",
      score: 0,
      signals: [],
    },
    resolvedAt: null,
    resolutionNote: null,
    resolvedBy: null,
  },
  {
    id: "demo-escalation-4",
    status: "resolved",
    createdAt: "2026-08-18T11:00:00.000Z",
    note: "Same phone number pattern as an account we barred last year.",
    communitySlug: "porto-queer-readers",
    communityName: "Porto Queer Readers",
    joinRequestId: "jr-resolved-demo",
    subject: {
      slug: "teo-ramalho",
      firstName: "Teo",
      lastName: "Ramalho",
      avatarUrl: null,
    },
    raisedBy: {
      slug: "ines-costa",
      firstName: "Inês",
      lastName: "Costa",
      avatarUrl: null,
    },
    assessment: {
      subjectId: "jr-resolved-demo",
      tier: "low",
      score: 15,
      signals: [
        {
          kind: "stated_details_match",
          removalKind: "community_ban",
          removedAt: "2025-11-08T12:00:00.000Z",
          removedAccountName: null,
          removedAccountSlug: null,
          communityName: "Braga Queer Kitchen",
        },
      ],
    },
    resolvedAt: "2026-08-19T08:25:00.000Z",
    resolutionNote:
      "Checked across every community and the platform ban list. One weak name match against an unrelated removal. Nothing to act on.",
    resolvedBy: {
      slug: "ana-marques",
      firstName: "Ana",
      lastName: "Marques",
      avatarUrl: null,
    },
  },
];
