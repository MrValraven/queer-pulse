import type {
  AdminGovernanceLogEntryDTO,
  AdminGovernanceLogMemberDTO,
  GovernanceLogAction,
} from "./api/adminCommunityGovernanceLog.api";

/**
 * Demo-mode governance trails, keyed by community slug. Dynamically imported
 * by `useAdminCommunityGovernanceLog` so none of this ships in the live
 * bundle — it is fabricated data and must never read as platform truth.
 *
 * `avatarUrl` is deliberately null throughout: the reader is a shared
 * live/demo component, so a fixture must not hand it a stock portrait that a
 * real member with the same name would then appear to own. Initials render
 * instead.
 *
 * A community with no entry here has a genuinely empty trail, which is how
 * demo mode exercises the empty state next to the populated one.
 */

const PEOPLE: Record<string, AdminGovernanceLogMemberDTO> = {
  ines: {
    slug: "ines-martins",
    name: "Inês Martins",
    initials: "IM",
    avatarUrl: null,
  },
  sofia: {
    slug: "sofia-almeida",
    name: "Sofia Almeida",
    initials: "SA",
    avatarUrl: null,
  },
  devon: {
    slug: "devon-okoro",
    name: "Devon Okoro",
    initials: "DO",
    avatarUrl: null,
  },
  kai: {
    slug: "kai-sousa",
    name: "Kai Sousa",
    initials: "KS",
    avatarUrl: null,
  },
  theo: {
    slug: "theo-mendes",
    name: "Théo Mendes",
    initials: "TM",
    avatarUrl: null,
  },
  marsh: { slug: "marsh-k", name: "Marsh K.", initials: "MK", avatarUrl: null },
  rita: {
    slug: "rita-carvalho",
    name: "Rita Carvalho",
    initials: "RC",
    avatarUrl: null,
  },
};

const HOUR_IN_MS = 60 * 60 * 1000;
const NOW = Date.now();

/** `[action, actorKey, targetKey, metadata, hoursAgo]` — compact enough that a
 *  long trail stays readable, and every row still carries real metadata. */
type EntrySeed = [
  GovernanceLogAction,
  keyof typeof PEOPLE | null,
  keyof typeof PEOPLE | null,
  Record<string, unknown> | null,
  number,
];

function buildTrail(
  slug: string,
  seeds: EntrySeed[],
): AdminGovernanceLogEntryDTO[] {
  return seeds.map(
    ([action, actorKey, targetKey, metadata, hoursAgo], index) => ({
      id: `${slug}-governance-${index + 1}`,
      action,
      actor: actorKey ? PEOPLE[actorKey]! : null,
      target: targetKey ? PEOPLE[targetKey]! : null,
      metadata,
      createdAt: new Date(NOW - hoursAgo * HOUR_IN_MS).toISOString(),
    }),
  );
}

const TRANS_FRIENDS_SEEDS: EntrySeed[] = [
  [
    "frozen",
    null,
    null,
    { reason: "open reports past the auto-freeze threshold" },
    3,
  ],
  ["unfrozen", "sofia", null, { adminOverride: true }, 8],
  ["role_changed", "ines", "devon", { fromRole: "member", toRole: "mod" }, 26],
  ["member_removed", "ines", "marsh", null, 31],
  [
    "settings_changed",
    "ines",
    null,
    { changes: { accessTier: { from: "public", to: "private" } } },
    54,
  ],
  [
    "role_changed",
    "sofia",
    "kai",
    { adminOverride: true, fromRole: "mod", toRole: "member" },
    73,
  ],
  [
    "settings_changed",
    "sofia",
    null,
    {
      adminOverride: true,
      changes: { requiresSecondVouch: { from: false, to: true } },
    },
    96,
  ],
  [
    "ownership_transferred",
    "sofia",
    "ines",
    { adminOverride: true, previousOwnerId: null },
    120,
  ],
  ["role_changed", "ines", "theo", { fromRole: "member", toRole: "mod" }, 148],
  ["unarchived", "sofia", null, { adminOverride: true }, 170],
  ["archived", "ines", null, null, 176],
  [
    "settings_changed",
    "ines",
    null,
    {
      changes: {
        tagline: {
          from: "",
          to: "A room for trans people and the people who love them",
        },
      },
    },
    200,
  ],
  ["member_removed", "theo", "rita", null, 224],
  ["role_changed", "ines", "rita", { fromRole: "mod", toRole: "member" }, 226],
  ["frozen", "sofia", null, { adminOverride: true }, 250],
  ["unfrozen", "sofia", null, { adminOverride: true }, 254],
  [
    "settings_changed",
    "devon",
    null,
    {
      changes: {
        rosterVisible: { from: true, to: false },
        rules: { from: ["Be kind"], to: ["Be kind", "No outing anyone, ever"] },
      },
    },
    290,
  ],
  [
    "owner_auto_promoted",
    null,
    "ines",
    { reason: "owner account erased", previousOwnerId: null },
    340,
  ],
  ["role_changed", "kai", "sofia", { fromRole: "member", toRole: "mod" }, 372],
  ["member_removed", "kai", null, { adminOverride: true }, 400],
  [
    "settings_changed",
    "kai",
    null,
    { changes: { autoFreezeOnReports: { from: false, to: true } } },
    430,
  ],
  ["role_changed", "kai", "devon", { fromRole: "member", toRole: "mod" }, 470],
  [
    "settings_changed",
    "kai",
    null,
    { changes: { isFeatured: { from: false, to: true } } },
    520,
  ],
];

const QUEER_CREATIVES_SEEDS: EntrySeed[] = [
  ["role_changed", "devon", "kai", { fromRole: "member", toRole: "mod" }, 12],
  [
    "settings_changed",
    "devon",
    null,
    { changes: { whoFor: { from: "Anyone", to: "Queer artists and makers" } } },
    64,
  ],
  ["member_removed", "devon", "marsh", { adminOverride: true }, 130],
  ["unfrozen", "sofia", null, { adminOverride: true }, 210],
  [
    "frozen",
    null,
    null,
    { reason: "open reports past the auto-freeze threshold" },
    214,
  ],
];

const LISBON_QUEERS_SEEDS: EntrySeed[] = [
  [
    "ownership_transferred",
    "sofia",
    "theo",
    { adminOverride: true, previousOwnerId: null },
    40,
  ],
  ["role_changed", "theo", "rita", { fromRole: "member", toRole: "mod" }, 88],
];

export const GOVERNANCE_LOG_BY_SLUG: Record<
  string,
  AdminGovernanceLogEntryDTO[]
> = {
  "trans-friends": buildTrail("trans-friends", TRANS_FRIENDS_SEEDS),
  "queer-creatives": buildTrail("queer-creatives", QUEER_CREATIVES_SEEDS),
  "lisbon-queers": buildTrail("lisbon-queers", LISBON_QUEERS_SEEDS),
};
