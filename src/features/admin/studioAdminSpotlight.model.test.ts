import { describe, expect, it } from "vitest";
import type { StudioArtistRefDTO } from "../studio/api/studio.types";
import type {
  AdminStudioSpotlightArtistDTO,
  AdminStudioSpotlightDTO,
  StudioSpotlightSlot,
} from "./api/studioSpotlightAdmin.api";
import {
  EMPTY_ADMIN_SPOTLIGHT,
  isNewStarsFull,
  isPickedBeforeThisMonth,
  newStarArtistIds,
  withoutSpotlightArtist,
  withSavedSpotlightArtist,
} from "./studioAdminSpotlight.model";

function artistNamed(artistId: string): StudioArtistRefDTO {
  return {
    id: artistId,
    handle: artistId,
    name: artistId,
    kind: "musician",
    avatarUrl: null,
  };
}

function rowOf(
  rowId: string,
  slot: StudioSpotlightSlot,
  position: number,
  note: string | null = null,
): AdminStudioSpotlightArtistDTO {
  return {
    id: rowId,
    slot,
    position,
    note,
    createdAt: "2026-10-01T10:00:00.000Z",
    isListenable: true,
    artist: artistNamed(`persona-${rowId}`),
  };
}

const starsOf = (count: number) =>
  Array.from({ length: count }, (_unused, index) =>
    rowOf(`star-${index + 1}`, "new_stars", index + 1),
  );

describe("the month pick age", () => {
  it("reads a pick from this calendar month as current", () => {
    expect(
      isPickedBeforeThisMonth(
        new Date(2026, 9, 1, 0, 30).toISOString(),
        new Date(2026, 9, 29).getTime(),
      ),
    ).toBe(false);
  });

  it("flags a pick from an earlier month", () => {
    expect(
      isPickedBeforeThisMonth(
        new Date(2026, 8, 30, 23).toISOString(),
        new Date(2026, 9, 29).getTime(),
      ),
    ).toBe(true);
    expect(
      isPickedBeforeThisMonth(
        new Date(2025, 11, 31).toISOString(),
        new Date(2026, 0, 2).getTime(),
      ),
    ).toBe(true);
  });
});

describe("the spotlight cache rules", () => {
  it("renumbers New stars after a removal", () => {
    const spotlight: AdminStudioSpotlightDTO = {
      artistOfTheMonth: null,
      newStars: starsOf(3),
    };
    const next = withoutSpotlightArtist(spotlight, "star-2");
    expect(next.newStars.map((star) => star.id)).toEqual(["star-1", "star-3"]);
    expect(next.newStars.map((star) => star.position)).toEqual([1, 2]);
  });

  it("clears the month row when it is the one removed", () => {
    const spotlight: AdminStudioSpotlightDTO = {
      artistOfTheMonth: rowOf("month", "artist_of_the_month", 1),
      newStars: starsOf(2),
    };
    const next = withoutSpotlightArtist(spotlight, "month");
    expect(next.artistOfTheMonth).toBeNull();
    expect(next.newStars).toHaveLength(2);
  });

  it("replaces the month row and appends a new star", () => {
    const spotlight: AdminStudioSpotlightDTO = {
      artistOfTheMonth: rowOf("month-old", "artist_of_the_month", 1, "old"),
      newStars: starsOf(2),
    };
    const freshMonth = rowOf("month-new", "artist_of_the_month", 1);
    const withMonth = withSavedSpotlightArtist(spotlight, freshMonth);
    expect(withMonth.artistOfTheMonth).toEqual(freshMonth);
    expect(withMonth.newStars).toEqual(spotlight.newStars);

    const added = withSavedSpotlightArtist(
      withMonth,
      rowOf("star-new", "new_stars", 99),
    );
    expect(added.newStars.map((star) => star.id)).toEqual([
      "star-1",
      "star-2",
      "star-new",
    ]);
    expect(added.newStars.map((star) => star.position)).toEqual([1, 2, 3]);
    expect(newStarArtistIds(added).has("persona-star-new")).toBe(true);

    const noted = withSavedSpotlightArtist(added, {
      ...rowOf("star-1", "new_stars", 1),
      note: "a fresh note",
    });
    expect(noted.newStars).toHaveLength(3);
    expect(noted.newStars[0]?.note).toBe("a fresh note");
  });

  it("counts New stars full at 12", () => {
    expect(isNewStarsFull(EMPTY_ADMIN_SPOTLIGHT.newStars)).toBe(false);
    expect(isNewStarsFull(starsOf(11))).toBe(false);
    expect(isNewStarsFull(starsOf(12))).toBe(true);
  });
});
