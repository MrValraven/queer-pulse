import { apiGet } from "../../../shared/api/client";

/** Current level + progress toward the next one. */
export interface LevelDTO {
  level: number;
  name: string;
  xp: number;
  xpMax: number;
  /** 0..100 progress toward the next level. */
  percent: number;
  xpToNext: number;
  /** Next level's name, or null at max level. */
  nextName: string | null;
}

export type LadderState = "done" | "current" | "locked";
export interface LevelLadderRowDTO {
  num: number;
  name: string;
  state: LadderState;
}

export type BadgeRarity = "common" | "rare" | "legendary";
export type BadgeTint = "jade" | "accent" | "plum";
export interface BadgeDTO {
  /** Stable slug the frontend maps to an icon (see badgeIcons). */
  key: string;
  cat: string;
  name: string;
  /** Free text: when/how it was earned (earned) or how to earn it (locked). */
  context: string;
  rarity: BadgeRarity;
  tint: BadgeTint;
}
export interface BadgesDTO {
  earnedCount: number;
  /** Number still to discover (catalogue minus earned). */
  discoverCount: number;
  earned: BadgeDTO[];
  locked: BadgeDTO[];
}

export type PerkState = "available" | "locked" | "claimed";
export type PerkFooterDTO =
  | { type: "active-auto"; autoLabel: string }
  | { type: "button"; label: string; toast: string }
  | { type: "link-auto"; label: string; to: string; autoLabel: string }
  | { type: "lock"; label: string }
  | { type: "claimed"; date: string };
export interface PerkDTO {
  cat: string;
  title: string;
  desc: string;
  state: PerkState;
  footer: PerkFooterDTO;
}
export interface PerkGroupDTO {
  label: string;
  perks: PerkDTO[];
}

export type PerkLadderState = "achieved" | "current" | "locked";
export interface PerkLadderRowDTO {
  num: number;
  name: string;
  state: PerkLadderState;
  /** Short status label, e.g. "Done", "Current", "320 XP away", "Locked". */
  status: string;
  perks: string[];
}
export interface PerksDTO {
  /** Perks currently claimable (drives the profile card chip). */
  availableCount: number;
  groups: PerkGroupDTO[];
  ladder: PerkLadderRowDTO[];
}

/** One "what you did to earn it" row — a signal category (e.g. `"vouches"`)
 *  or the synthetic `"badges"` bonus row. `key` is a stable id the frontend
 *  resolves to a label/icon itself (see `xpBreakdown.data.ts`) — no display
 *  text crosses the wire. Owner-only: `[]` on another member's recognition. */
export interface XpBreakdownItemDTO {
  key: string;
  units: number;
  cap: number;
  perUnit: number;
  xp: number;
}

/** The full Recognition payload: level, badges and perks for one member. */
export interface RecognitionDTO {
  level: LevelDTO;
  levelLadder: LevelLadderRowDTO[];
  badges: BadgesDTO;
  perks: PerksDTO;
  xpBreakdown: XpBreakdownItemDTO[];
}

/** Own recognition (GET /me/recognition) or another member's public subset
 *  (GET /profiles/:slug/recognition — perks omitted for non-owners). */
export const getRecognition = (slug?: string) =>
  apiGet<RecognitionDTO>(
    slug ? `/profiles/${slug}/recognition` : "/me/recognition",
  );
