/**
 * Display names for the recognition level ladder.
 *
 * The backend's `LEVEL_LADDER_DEF` (`recognition.catalog.ts`) is content in
 * code: seven rungs, each with a `level` number, an English `name` and an XP
 * span. The name used to travel on the wire (`LevelDTO.name`, `nextName`,
 * `LevelLadderRowDTO.name`) and render straight onto a translated page, so a
 * PT member read "Familiar" and "Pillar" on their own profile hero.
 *
 * The level NUMBER is the id, and it is safe to treat as one: no level name or
 * number is persisted anywhere. `recognition_stats` stores only `xp`
 * (migration `1782800130000-AddRecognition`, columns `user_id`, `xp`,
 * `updated_at`), and every rung is derived from that total by `levelStartXp`.
 * There is no `recognition_awards.badge_key` equivalent for levels, so nothing
 * is orphaned by owning the words here.
 *
 * Same shape as `badgeCatalog.data.ts` and `xpBreakdown.data.ts`: the wire
 * carries the machine value, the frontend owns the display text, and a level
 * this map has not caught up with resolves to null so the caller falls back to
 * the server's own English rather than rendering nothing.
 *
 * These keys are deliberately their own group. Level 3 is called "Regular" and
 * so is the `regular-attendee` BADGE, and they are different things: one is
 * where a member stands on the ladder, the other is something they earned once.
 * Sharing a key would tie their Portuguese together for no reason beyond an
 * English coincidence.
 */
export const LEVEL_NAME_KEY_BY_NUMBER: Record<number, string> = {
  1: "members:levels.newcomer",
  2: "members:levels.explorer",
  3: "members:levels.regular",
  4: "members:levels.familiar",
  5: "members:levels.trusted",
  6: "members:levels.anchor",
  7: "members:levels.pillar",
};

/** i18n key for a level's name, or null for a rung this build does not know,
 *  so the caller falls back to the server's own word. */
export function levelNameKeyFor(level: number): string | null {
  return LEVEL_NAME_KEY_BY_NUMBER[level] ?? null;
}
