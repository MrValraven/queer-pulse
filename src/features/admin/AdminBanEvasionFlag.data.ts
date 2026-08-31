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

/**
 * Demo-mode ban-evasion assessments for accounts that are already on the
 * platform, keyed by the admin member id the drawer is open on. Backs the
 * on-demand check in the member drawer with no backend.
 *
 * Only the accounts that carry a signal are listed. Anyone missing is a clear
 * result (`tier: "none"`), which the hook composes rather than storing a row
 * per fixture member, because that is exactly what the backend returns for an
 * account nothing correlates with.
 */
export const BAN_EVASION_USER_ASSESSMENTS: Record<
  string,
  BanEvasionAssessmentDTO
> = {
  anon_4471: {
    subjectId: "anon_4471",
    tier: "high",
    score: 85,
    signals: [
      {
        kind: "sign_in_identifier_match",
        removalKind: "platform_ban",
        removedAt: "2026-06-21T09:15:00.000Z",
        // Erased account: only the date and the kind of removal survive.
        removedAccountName: null,
        removedAccountSlug: null,
        communityName: null,
      },
      {
        kind: "stated_details_match",
        removalKind: "community_ban",
        removedAt: "2026-03-11T18:45:00.000Z",
        removedAccountName: "Rui Belmiro",
        removedAccountSlug: "rui-belmiro",
        communityName: "Lisboa Trans Social",
      },
    ],
  },
};

/** The assessment the backend returns for an account nothing correlates with:
 *  a stated "checked, clear", never an empty response. */
export function clearBanEvasionAssessment(
  subjectId: string,
): BanEvasionAssessmentDTO {
  return { subjectId, tier: "none", score: 0, signals: [] };
}
