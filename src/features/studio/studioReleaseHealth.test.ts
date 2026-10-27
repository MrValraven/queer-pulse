import { describe, expect, it } from "vitest";
import type {
  StudioDashboardReleaseView,
  StudioReleaseHealthItemView,
} from "./api/studioDashboard.adapters";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import type { StudioReleaseStatus } from "./api/studio.types";
import { STUDIO_RELEASE_HEALTH_KEYS } from "./api/studioDashboard.types";
import {
  RELEASE_HEALTH_DONE_KEY,
  RELEASE_HEALTH_TARGET,
  RELEASE_HEALTH_TODO_KEY,
  releaseHealthFixHref,
  releasesNeedingWorkOf,
} from "./studioReleaseHealth";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";

function releaseRowOf(
  id: string,
  status: StudioReleaseStatus,
  items: StudioReleaseHealthItemView[],
): StudioDashboardReleaseView {
  const doneCount = items.filter((item) => item.isDone).length;
  return {
    release: { id, title: `Release ${id}` } as StudioReleaseCardView,
    status,
    health: {
      items,
      doneCount,
      totalCount: items.length,
      hasOpenItems: doneCount < items.length,
    },
  } as StudioDashboardReleaseView;
}

const doneCover: StudioReleaseHealthItemView = {
  key: "cover",
  isDone: true,
  isOptional: false,
};

const done = (id: string) => releaseRowOf(id, "published", [doneCover]);
const optionalOpen = (id: string) =>
  releaseRowOf(id, "published", [
    doneCover,
    { key: "lyrics", isDone: false, isOptional: true },
  ]);
const takenDown = (id: string) => releaseRowOf(id, "taken_down", []);
const requiredOpen = (id: string, status: StudioReleaseStatus) =>
  releaseRowOf(id, status, [
    doneCover,
    { key: "description", isDone: false, isOptional: false },
  ]);

describe("studioReleaseHealth", () => {
  it("links each open item to its field in the release editor", () => {
    expect(releaseHealthFixHref("r1", "genreAndMood")).toBe(
      "/studio/upload?release=r1#studio-release-genre",
    );
    expect(releaseHealthFixHref("r1", "creditsOnEveryTrack")).toBe(
      "/studio/upload?release=r1&step=tracks#studio-release-track-credits",
    );
    expect(releaseHealthFixHref("r1", "lyrics")).toBe(
      "/studio/upload?release=r1&step=tracks#studio-release-tracks",
    );
    expect(releaseHealthFixHref("r1", "versionNote")).toBe(
      "/studio/upload?release=r1&step=tracks#studio-release-version-note",
    );
  });

  it("has copy and a target for every key", () => {
    for (const key of STUDIO_RELEASE_HEALTH_KEYS) {
      expect(RELEASE_HEALTH_TODO_KEY[key]).toBe(
        `studio:numbers.health.todo.${key}`,
      );
      expect(RELEASE_HEALTH_DONE_KEY[key]).toBe(
        `studio:numbers.health.done.${key}`,
      );
      expect(RELEASE_FIELD_IDS[RELEASE_HEALTH_TARGET[key].field]).toEqual(
        expect.any(String),
      );
    }
  });

  it("lists drafts, scheduled and published releases with an open item, optional ones included, in server order", () => {
    const rows = releasesNeedingWorkOf([
      done("a"),
      optionalOpen("b"),
      takenDown("c"),
      requiredOpen("d", "draft"),
      requiredOpen("e", "scheduled"),
    ]);
    expect(rows.map((row) => row.release.id)).toEqual(["b", "d", "e"]);
  });
});
