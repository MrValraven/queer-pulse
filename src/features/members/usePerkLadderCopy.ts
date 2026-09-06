import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PerkLadderEntry, PerkLadderRow } from "./badges.data";
import { perkLadderEntryLabelKeyFor } from "./perkCatalog.data";

/**
 * The words for one perks-ladder row.
 *
 * The wire used to carry finished English sentences here, and the ladder
 * flattened a level's baseline capabilities and its claimable perks into one
 * untyped `string[]`, so nothing on the page could tell which entry was
 * which. Each entry now arrives as a stable id beside the English, and these
 * helpers resolve the id through `perkCatalog.data.ts`. An id this build does
 * not know falls back to the server's own English rather than to a blank or a
 * raw identifier, the same rule `badgeDisplayMetaFor` and `levelNameKeyFor`
 * already follow.
 */
export function usePerkLadderRowLabels(entries: PerkLadderEntry[]): string[] {
  const { t } = useTranslation();
  return entries.map((entry) => {
    const labelKey = perkLadderEntryLabelKeyFor(entry.id);
    return labelKey ? t(labelKey) : entry.label;
  });
}

/**
 * The row's short status: "Done", "Current", or how much XP is still to go.
 *
 * `locked` is demo-only. The live backend always knows the gap and sends
 * `xp-away`, so a bare "Locked" only ever comes from the prototype fixture.
 */
export function usePerkLadderRowStatus(row: PerkLadderRow): string {
  const { t } = useTranslation();
  switch (row.statusKind) {
    case "done":
      return t("members:perks.ladder.statusDone");
    case "current":
      return t("members:perks.ladder.statusCurrent");
    case "locked":
      return t("members:perks.ladder.statusLocked");
    case "xp-away":
      return row.xpAway === undefined
        ? row.status
        : t("members:perks.ladder.statusXpAway", { count: row.xpAway });
  }
}
