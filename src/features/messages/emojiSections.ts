// src/features/messages/emojiSections.ts
import type { EmojiEntry, EmojiGroupKey } from "./emoji.data";
import type { RecentEmoji } from "./emojiRecents";

/** Just enough of `EmojiEntry`/`RecentEmoji` to render a grid button and its
 *  accessible name — both shapes already satisfy this structurally, so the
 *  grid never needs to know which source an item came from. */
export interface EmojiGridItem {
  glyph: string;
  label: string;
  labelPt: string;
}

/** One labelled band in the picker: "recents" (only when non-empty) followed
 *  by the nine dataset groups, in `EMOJI_GROUP_ORDER`. A live search replaces
 *  this whole list with a single "results" section instead. */
export interface EmojiSection {
  key: string;
  items: EmojiGridItem[];
}

/** The translation key for each section's rail tab / accessible name. Kept
 *  beside the section-building logic so the rail and the grid can never
 *  drift on which label goes with which group. */
export const EMOJI_SECTION_LABEL_KEY: Record<string, string> = {
  recents: "messages:emoji.recentsLabel",
  smileys: "messages:emoji.categorySmileys",
  people: "messages:emoji.categoryPeople",
  animals: "messages:emoji.categoryAnimals",
  food: "messages:emoji.categoryFood",
  activities: "messages:emoji.categoryActivities",
  travel: "messages:emoji.categoryTravel",
  objects: "messages:emoji.categoryObjects",
  symbols: "messages:emoji.categorySymbols",
  flags: "messages:emoji.categoryFlags",
};

/** Groups the full dataset by `EmojiGroupKey` in a single pass — the dataset
 *  is already contiguous per group (see `emoji.data.ts`'s own contract), so
 *  this only exists to hand `buildEmojiSections` an O(1) lookup instead of
 *  filtering the 1,914-entry array once per group. A group absent from the
 *  map (shouldn't happen, but the type can't promise it) falls back to an
 *  empty list at every read site below, never a non-null assertion. */
function groupEntriesByGroup(
  entries: EmojiEntry[],
): Partial<Record<EmojiGroupKey, EmojiEntry[]>> {
  const grouped: Partial<Record<EmojiGroupKey, EmojiEntry[]>> = {};
  for (const entry of entries) {
    const bucket = grouped[entry.group];
    if (bucket) bucket.push(entry);
    else grouped[entry.group] = [entry];
  }
  return grouped;
}

/** Builds the picker's normal (non-searching) section list: recents first
 *  (omitted entirely when empty, never shown as an empty band), then every
 *  dataset group in order. */
export function buildEmojiSections(
  groupOrder: EmojiGroupKey[],
  allEntries: EmojiEntry[],
  recents: RecentEmoji[],
): EmojiSection[] {
  const grouped = groupEntriesByGroup(allEntries);
  const sections: EmojiSection[] = [];
  if (recents.length > 0) {
    sections.push({ key: "recents", items: recents });
  }
  for (const groupKey of groupOrder) {
    sections.push({ key: groupKey, items: grouped[groupKey] ?? [] });
  }
  return sections;
}

/** Builds the single "results" section a live search shows instead of the
 *  recents + category bands. */
export function buildSearchResultSections(
  items: EmojiGridItem[],
): EmojiSection[] {
  return [{ key: "results", items }];
}
