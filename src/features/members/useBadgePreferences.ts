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

/**
 * A member's intent to hide an earned badge from their profile, keyed by
 * badge key. Stored client-side only — there's no backend field to enforce
 * this on another viewer's request yet, so callers must surface that this
 * hides the badge here, not on the public profile (see BadgeDrawer).
 */
export function useBadgeVisibilityPrefs() {
  const [hiddenBadgeKeys, setHiddenBadgeKeys] = useLocalStorage<string[]>(
    "qp-badges-hidden-from-profile-intent",
    [],
    isStringArray,
  );

  const toggleHidden = (badgeKey: string) => {
    setHiddenBadgeKeys((previous) =>
      previous.includes(badgeKey)
        ? previous.filter((entry) => entry !== badgeKey)
        : [...previous, badgeKey],
    );
  };

  return {
    isHidden: (badgeKey: string) => hiddenBadgeKeys.includes(badgeKey),
    toggleHidden,
  };
}

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
