import { type Tint, type ChangemakerStory } from "./changemakerStories.types";
import { STORIES_PART_1 } from "./changemakerStories.part1.data";
import { STORIES_PART_2 } from "./changemakerStories.part2.data";

export type { Tint, ChangemakerStory };

export const CHANGEMAKERS: ChangemakerStory[] = [
  ...STORIES_PART_1,
  ...STORIES_PART_2,
];

export function getChangemaker(slug: string | undefined): ChangemakerStory | undefined {
  return CHANGEMAKERS.find((c) => c.slug === slug);
}
