import { describe, expect, it } from "vitest";
import type { AdminStudioSceneDTO } from "./api/studioDiscoveryAdmin.api";
import { ApiError } from "../../shared/api/client";
import {
  ageOf,
  isSameIdSet,
  isValidSceneSlug,
  movedIds,
  SCENE_SLUG_FALLBACK_BASE,
  sceneSlugCandidates,
  sceneSlugFromName,
  sortedAdminScenes,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";

describe("movedIds", () => {
  it("moves one id to a target index", () => {
    expect(movedIds(["a", "b", "c"], "c", 0)).toEqual(["c", "a", "b"]);
    expect(movedIds(["a", "b", "c"], "a", 1)).toEqual(["b", "a", "c"]);
  });

  it("answers null for a move that changes nothing or leaves the list", () => {
    expect(movedIds(["a", "b"], "a", 0)).toBeNull();
    expect(movedIds(["a", "b"], "b", 2)).toBeNull();
    expect(movedIds(["a", "b"], "z", 0)).toBeNull();
  });
});

describe("isSameIdSet", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  it("accepts every id once in any order", () => {
    expect(isSameIdSet(["c", "a", "b"], items)).toBe(true);
    expect(isSameIdSet([], [])).toBe(true);
  });

  it("refuses a list that misses, repeats or adds an id", () => {
    expect(isSameIdSet(["a", "b"], items)).toBe(false);
    expect(isSameIdSet(["a", "a", "b"], items)).toBe(false);
    expect(isSameIdSet(["a", "b", "z"], items)).toBe(false);
    expect(isSameIdSet(["a", "b", "c", "d"], items)).toBe(false);
  });
});

describe("ageOf", () => {
  const now = Date.parse("2026-10-13T12:00:00.000Z");
  it("names the age in the largest whole unit", () => {
    expect(ageOf("2026-10-13T11:59:30.000Z", now)).toEqual({
      value: 1,
      unit: "minute",
    });
    expect(ageOf("2026-10-13T09:00:00.000Z", now)).toEqual({
      value: 3,
      unit: "hour",
    });
    expect(ageOf("2026-10-06T12:00:00.000Z", now)).toEqual({
      value: 7,
      unit: "day",
    });
  });
});

describe("scene slugs", () => {
  it("builds a slug from a name the way the server does", () => {
    expect(sceneSlugFromName("  Café Nights, Porto!  ")).toBe(
      "cafe-nights-porto",
    );
    expect(sceneSlugFromName("x".repeat(80))).toHaveLength(60);
  });

  it("falls back to the base the server uses for a name with no letters", () => {
    expect(sceneSlugFromName("!!")).toBe(SCENE_SLUG_FALLBACK_BASE);
    expect(sceneSlugFromName("Á")).toBe(SCENE_SLUG_FALLBACK_BASE);
  });

  it("tries the base, then -2 up to -50, each within 60 characters", () => {
    const candidates = sceneSlugCandidates("porto");
    expect(candidates.slice(0, 3)).toEqual(["porto", "porto-2", "porto-3"]);
    expect(candidates).toHaveLength(50);
    expect(candidates[49]).toBe("porto-50");
    for (const candidate of sceneSlugCandidates("a".repeat(60)))
      expect(isValidSceneSlug(candidate)).toBe(true);
  });

  it("checks the slug pattern and length", () => {
    expect(isValidSceneSlug("mouraria-fado")).toBe(true);
    expect(isValidSceneSlug("a")).toBe(false);
    expect(isValidSceneSlug("double--hyphen")).toBe(false);
    expect(isValidSceneSlug("Upper")).toBe(false);
  });
});

describe("studioAdminSaveErrorKeyOf", () => {
  it("names a refused write by its Studio code, else by the console's save line", () => {
    expect(
      studioAdminSaveErrorKeyOf(
        new ApiError(409, "Conflict", { code: "studio_curation_shelf_full" }),
      ),
    ).toBe("studio:errors.curationShelfFull");
    expect(studioAdminSaveErrorKeyOf(new Error("offline"))).toBe(
      "admin:studioAdmin.saveError",
    );
  });
});

describe("sortedAdminScenes", () => {
  const scene = (
    id: string,
    status: AdminStudioSceneDTO["status"],
    position: number,
    name: string,
  ): AdminStudioSceneDTO => ({
    id,
    slug: id,
    name,
    city: "Lisboa",
    blurb: null,
    coverUrl: null,
    status,
    position,
    releaseCount: 0,
    pinnedEventCount: 0,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  });

  it("lists active scenes by position, then archived scenes by name", () => {
    const sorted = sortedAdminScenes([
      scene("zeta", "archived", 9, "Zeta"),
      scene("two", "active", 2, "Two"),
      scene("alpha", "archived", 3, "Alpha"),
      scene("one", "active", 1, "One"),
    ]);
    expect(sorted.map((entry) => entry.id)).toEqual([
      "one",
      "two",
      "alpha",
      "zeta",
    ]);
  });
});
