import type {
  Badge,
  LadderPill,
  PerkLadderRow,
  XpLedgerEntry,
} from "../badges.data";
import type { PerkGroup } from "../perks.data";
import { badgeIconFor } from "../badgeIcons";
import type { BadgeDTO, RecognitionDTO } from "./recognition.api";

/** Level + progress, without the profile-owned fields (member name / join
 *  date), which the pages read from the profile instead. */
export interface RecognitionLevel {
  level: number;
  name: string;
  xp: number;
  xpMax: number;
  percent: number;
  xpToNext: number;
  nextName: string;
}

/** One XP source row — see `XpBreakdownItemDTO`. */
export interface XpBreakdownItem {
  key: string;
  units: number;
  cap: number;
  perUnit: number;
  xp: number;
}

/** The domain model the profile card, badges page and perks page all render. */
export interface Recognition {
  level: RecognitionLevel;
  levelLadder: LadderPill[];
  badges: {
    earned: Badge[];
    locked: Badge[];
    seasonal: Badge[];
    earnedCount: number;
    discoverCount: number;
  };
  perks: {
    groups: PerkGroup[];
    ladder: PerkLadderRow[];
    availableCount: number;
  };
  xpBreakdown: XpBreakdownItem[];
  xpLedger: XpLedgerEntry[];
}

/** A zeroed Recognition used in live mode while the fetch is in flight or has
 *  errored — so field access never throws, yet nothing fictional (the demo
 *  fixtures) is ever presented as the member's real level/badges/perks.
 *  Callers gate on the hook's `isLoading`/`isError`/`hasRealData` flags to
 *  render loading/error/empty states rather than this placeholder. */
export const emptyRecognition: Recognition = {
  level: {
    level: 0,
    name: "",
    xp: 0,
    xpMax: 0,
    percent: 0,
    xpToNext: 0,
    nextName: "",
  },
  levelLadder: [],
  badges: {
    earned: [],
    locked: [],
    seasonal: [],
    earnedCount: 0,
    discoverCount: 0,
  },
  perks: { groups: [], ladder: [], availableCount: 0 },
  xpBreakdown: [],
  xpLedger: [],
};

function badgeFromDto(b: BadgeDTO): Badge {
  return {
    key: b.key,
    category: b.cat,
    name: b.name,
    when: b.context,
    rarity: b.rarity,
    tint: b.tint,
    icon: badgeIconFor(b.key),
    criteria: b.criteria,
    xpReward: b.xpReward,
    progress: b.progress,
    verifiedBy: b.verifiedBy,
    seasonal: b.seasonal,
    hiddenFromProfile: b.hiddenFromProfile ?? false,
  };
}

/** Map the Recognition DTO to the domain model the UI already renders. */
export function recognitionToModel(dto: RecognitionDTO): Recognition {
  return {
    level: {
      level: dto.level.level,
      name: dto.level.name,
      xp: dto.level.xp,
      xpMax: dto.level.xpMax,
      percent: dto.level.percent,
      xpToNext: dto.level.xpToNext,
      nextName: dto.level.nextName ?? "",
    },
    levelLadder: dto.levelLadder.map((r) => ({
      number: r.num,
      name: r.name,
      state: r.state,
    })),
    badges: {
      earnedCount: dto.badges.earnedCount,
      discoverCount: dto.badges.discoverCount,
      earned: dto.badges.earned.map(badgeFromDto),
      locked: dto.badges.locked.map(badgeFromDto),
      seasonal: dto.badges.seasonal.map(badgeFromDto),
    },
    perks: {
      availableCount: dto.perks.availableCount,
      groups: dto.perks.groups.map((g) => ({
        label: g.label,
        perks: g.perks.map((perk) => ({
          key: perk.key,
          category: perk.cat,
          title: perk.title,
          description: perk.desc,
          state: perk.state,
          footer: perk.footer,
        })),
      })),
      ladder: dto.perks.ladder.map((r) => ({
        number: r.num,
        name: r.name,
        state: r.state,
        status: r.status,
        perks: r.perks,
      })),
    },
    xpBreakdown: dto.xpBreakdown.map((item) => ({
      key: item.key,
      units: item.units,
      cap: item.cap,
      perUnit: item.perUnit,
      xp: item.xp,
    })),
    xpLedger: dto.xpLedger.map((entry) => ({
      createdAt: entry.createdAt,
      description: entry.description,
      xp: entry.xp,
      reason: entry.reason,
    })),
  };
}
