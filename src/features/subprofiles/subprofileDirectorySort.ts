import type {
  SubprofileCardDTO,
  SubprofileDirectorySort,
} from "./api/subprofiles.api";

export type { SubprofileDirectorySort } from "./api/subprofiles.api";

/** One option in the directory's sort control. */
export interface DirectorySortOption {
  value: SubprofileDirectorySort;
  labelKey: string;
}

/** The sort control's options, in display order. */
export const SORT_OPTIONS: readonly DirectorySortOption[] = [
  { value: "recent", labelKey: "subprofiles:directory.sort.recent" },
  { value: "followed", labelKey: "subprofiles:directory.sort.followed" },
  { value: "name", labelKey: "subprofiles:directory.sort.name" },
];

/** The page's starting order. The server's own default stays `name`, so the
 *  page always sends this one explicitly. */
export const DEFAULT_DIRECTORY_SORT: SubprofileDirectorySort = "recent";

/** Whether a stored or URL value is one of the sort options. */
export function isSubprofileDirectorySort(
  value: unknown,
): value is SubprofileDirectorySort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

const byDisplayName = (
  firstCard: SubprofileCardDTO,
  secondCard: SubprofileCardDTO,
) =>
  firstCard.displayName.localeCompare(secondCard.displayName) ||
  (firstCard.id ?? firstCard.handle).localeCompare(
    secondCard.id ?? secondCard.handle,
  );

/**
 * Demo mode's twin of the endpoint's `sort`. `recent` keeps the fixture's own
 * order (the registry is authored newest first), `followed` puts the most
 * followed first with the name as the tie-break, and `name` orders by display
 * name, as the server does. Returns a new array and leaves `cards` untouched.
 */
export function sortDirectoryCards(
  cards: readonly SubprofileCardDTO[],
  sort: SubprofileDirectorySort,
): SubprofileCardDTO[] {
  if (sort === "recent") return [...cards];
  if (sort === "followed") {
    return [...cards].sort(
      (firstCard, secondCard) =>
        secondCard.followerCount - firstCard.followerCount ||
        byDisplayName(firstCard, secondCard),
    );
  }
  return [...cards].sort(byDisplayName);
}
