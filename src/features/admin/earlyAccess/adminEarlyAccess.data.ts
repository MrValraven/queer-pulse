import { EARLY_ACCESS_FEATURE_KEYS } from "../../../shared/contracts/earlyAccess";
import type { AuthUser } from "../../auth/api/auth.api";
import {
  currentUser,
  currentUserSlug,
} from "../../members/data/demoCurrentUser";
import { fullName } from "../../members/data/fullName";
import { portrait } from "../adminPeople.data";
import { MEMBERS } from "../adminMembers.data";
import type {
  EarlyAccessFeaturesDTO,
  EarlyAccessGrantedByDTO,
  EarlyAccessRosterDTO,
  EarlyAccessRosterRowDTO,
  MemberEarlyAccessDTO,
} from "../api/adminEarlyAccess.types";

// Demo early access, keyed by the admin members demo roster's ids
// (`adminMembers.data.ts` MEMBERS), so the member drawer and the roster page
// show the same testers. The roster is the source; the per-member records and
// the grant counts derive from it.

/** The server's roster cap. */
export const DEMO_EARLY_ACCESS_ROSTER_LIMIT = 200;

/** The staff member the seeded demo grants name: the demo roster's admin,
 *  kept as the history of who let the first testers in. */
export const DEMO_EARLY_ACCESS_SEED_GRANTOR: EarlyAccessGrantedByDTO = {
  id: "ines",
  displayName: "Inês Martins",
};

/** The staff member a new demo grant names: the demo session's signed-in
 *  account, so the drawer credits whoever flipped the switch. A session
 *  without a profile falls back to the demo persona's slug and name. */
export function demoEarlyAccessGrantorFor(
  signedInUser: AuthUser | null,
): EarlyAccessGrantedByDTO {
  const profile = signedInUser?.profile;
  const profileName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "";
  return {
    id: signedInUser?.id ?? currentUserSlug,
    displayName: profileName || fullName(currentUser),
  };
}

/** A demo roster member's row shape (name, slug and fixture portrait), or
 *  null for an id outside the demo members roster. */
export function demoEarlyAccessRosterMember(
  memberId: string,
): EarlyAccessRosterRowDTO["member"] | null {
  const member = MEMBERS.find((candidate) => candidate.id === memberId);
  if (!member) return null;
  return {
    userId: member.id,
    slug: member.slug,
    displayName: member.name,
    avatarUrl: portrait(member.name) ?? null,
  };
}

function demoRosterRow(
  memberId: string,
  grantedAt: string,
): EarlyAccessRosterRowDTO[] {
  const member = demoEarlyAccessRosterMember(memberId);
  return member
    ? [{ member, grantedAt, grantedBy: DEMO_EARLY_ACCESS_SEED_GRANTOR }]
    : [];
}

const QUIZSHOW_ROWS: EarlyAccessRosterRowDTO[] = [
  ...demoRosterRow("devon", "2026-10-18T19:30:00.000Z"),
  ...demoRosterRow("theo", "2026-10-16T11:05:00.000Z"),
  ...demoRosterRow("kai", "2026-10-14T16:45:00.000Z"),
];

/** Who holds each feature in the demo, newest first. */
export const DEMO_EARLY_ACCESS_ROSTER: Record<string, EarlyAccessRosterDTO> = {
  quizshow: {
    featureKey: "quizshow",
    total: QUIZSHOW_ROWS.length,
    limit: DEMO_EARLY_ACCESS_ROSTER_LIMIT,
    items: QUIZSHOW_ROWS,
  },
};

/** The roster for a feature, or an empty one for a feature nobody holds. */
export function demoEarlyAccessRoster(
  featureKey: string,
): EarlyAccessRosterDTO {
  return (
    DEMO_EARLY_ACCESS_ROSTER[featureKey] ?? {
      featureKey,
      total: 0,
      limit: DEMO_EARLY_ACCESS_ROSTER_LIMIT,
      items: [],
    }
  );
}

/** Every feature in early access (registry order) with its demo grant count. */
export const DEMO_EARLY_ACCESS_FEATURES: EarlyAccessFeaturesDTO = {
  features: EARLY_ACCESS_FEATURE_KEYS.map((featureKey) => ({
    featureKey,
    grantCount: demoEarlyAccessRoster(featureKey).total,
  })),
};

function memberRecordFromRoster(memberId: string): MemberEarlyAccessDTO {
  return {
    features: EARLY_ACCESS_FEATURE_KEYS.map((featureKey) => {
      const row = demoEarlyAccessRoster(featureKey).items.find(
        (candidate) => candidate.member.userId === memberId,
      );
      return {
        featureKey,
        grant: row
          ? {
              featureKey,
              userId: memberId,
              grantedAt: row.grantedAt,
              grantedBy: row.grantedBy,
            }
          : null,
      };
    }),
  };
}

/** Demo early access for the members who hold a grant, keyed by member id. */
export const DEMO_MEMBER_EARLY_ACCESS: Record<string, MemberEarlyAccessDTO> =
  Object.fromEntries(
    MEMBERS.map((member) => ({
      memberId: member.id,
      record: memberRecordFromRoster(member.id),
    }))
      .filter(({ record }) =>
        record.features.some((feature) => feature.grant !== null),
      )
      .map(({ memberId, record }): [string, MemberEarlyAccessDTO] => [
        memberId,
        record,
      ]),
  );

/** A member's demo early access: their record, or every feature off. */
export function demoMemberEarlyAccess(memberId: string): MemberEarlyAccessDTO {
  return DEMO_MEMBER_EARLY_ACCESS[memberId] ?? memberRecordFromRoster(memberId);
}
