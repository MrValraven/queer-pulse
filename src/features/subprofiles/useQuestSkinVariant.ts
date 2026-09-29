import { useSearchParams } from "react-router-dom";

export type QuestSkinVariant = "sheet" | "map";

/**
 * Which of the two Quest skin concepts to draw, from `?questSkin=`. A design
 * comparison switch for the owner: read from the URL on the page and the
 * editor preview, kept out of storage, and defaulting to the character sheet.
 * Removed once one concept is chosen.
 */
export function useQuestSkinVariant(): QuestSkinVariant {
  const [searchParams] = useSearchParams();
  return searchParams.get("questSkin") === "map" ? "map" : "sheet";
}
