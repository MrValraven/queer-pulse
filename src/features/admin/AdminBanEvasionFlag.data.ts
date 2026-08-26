import type { BanEvasionAssessmentDTO } from "./api/adminInvites.api";

/**
 * Demo-mode ban-evasion assessments, keyed by join-request id, so the invite
 * review queue renders the flag with no backend. Mirrors
 * {@link BanEvasionAssessmentDTO} exactly.
 *
 * One row carries a real signal (the already-flagged demo applicant), and it
 * deliberately mixes a named removed account with an erased one, because those
 * are the two shapes the panel has to render.
 */
export const BAN_EVASION_ASSESSMENTS: Record<string, BanEvasionAssessmentDTO> =
  {
    "jr-flagged-demo": {
      subjectId: "jr-flagged-demo",
      tier: "medium",
      score: 50,
      signals: [
        {
          kind: "intake_contact_match",
          removalKind: "platform_ban",
          removedAt: "2026-05-14T10:00:00.000Z",
          // Erased account: only the date and the kind of removal survive.
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
  };
