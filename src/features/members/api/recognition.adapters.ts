import type { Badge, LadderPill, PerkLadderRow } from "../badges.data";
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

/** The domain model the profile card, badges page and perks page all render. */
export interface Recognition {
  level: RecognitionLevel;
  levelLadder: LadderPill[];
  badges: {
    earned: Badge[];
    locked: Badge[];
    earnedCount: number;
    discoverCount: number;
  };
  perks: {
    groups: PerkGroup[];
    ladder: PerkLadderRow[];
    availableCount: number;
  };
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
  badges: { earned: [], locked: [], earnedCount: 0, discoverCount: 0 },
  perks: { groups: [], ladder: [], availableCount: 0 },
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
    },
    perks: {
      availableCount: dto.perks.availableCount,
      groups: dto.perks.groups.map((g) => ({
        label: g.label,
        perks: g.perks.map((p) => ({
          category: p.cat,
          title: p.title,
          description: p.desc,
          state: p.state,
          footer: p.footer,
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
  };
}
