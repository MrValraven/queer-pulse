import { useLocalStorage } from "../../shared/hooks";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/**
 * Categories a member has muted from the momentum/fast-XP suggestions —
 * "not for me," never a penalty. Client-only preference (no backend field),
 * same as the source design's own approach.
 */
export function useMutedBadgeCategories() {
  const [mutedCategories, setMutedCategories] = useLocalStorage<string[]>(
    "qp-badges-muted-categories",
    [],
    isStringArray,
  );

  const toggleCategory = (category: string) => {
    setMutedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((entry) => entry !== category)
        : [...previous, category],
    );
  };

  return {
    mutedCategories,
    isCategoryMuted: (category: string) => mutedCategories.includes(category),
    toggleCategory,
    unmuteAll: () => setMutedCategories([]),
  };
}

// Per-badge profile visibility used to live here as a `localStorage` list of
// hidden badge keys, which changed nothing for any other viewer. It is a real
// server column now (`recognition_awards.hidden_from_profile`, SUS-04) written
// through `useSetBadgeVisibility` and honoured on the read path, so the
// client-only hook is gone rather than left as a second, weaker source of
// truth.

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === "object" &&
  value !== null &&
  Object.values(value).every((entry) => typeof entry === "string");

/** A member's personal one-line note on an earned badge. Private to them,
 *  stored client-side only. */
export function useBadgeStoryNotes() {
  const [storyNotes, setStoryNotes] = useLocalStorage<Record<string, string>>(
    "qp-badges-story-notes",
    {},
    isStringRecord,
  );

  return {
    getStoryNote: (badgeKey: string) => storyNotes[badgeKey] ?? "",
    setStoryNote: (badgeKey: string, value: string) =>
      setStoryNotes((previous) => ({ ...previous, [badgeKey]: value })),
  };
}
