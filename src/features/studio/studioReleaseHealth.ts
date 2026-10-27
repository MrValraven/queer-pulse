// The release checklist on the dashboard: where each open item lives in the
// release editor, its copy keys, and which releases still have work left.
import type { StudioDashboardReleaseView } from "./api/studioDashboard.adapters";
import type { StudioReleaseHealthKey } from "./api/studioDashboard.types";
import { studioReleaseFieldPath } from "./studioPaths";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";

/** The editor step and field each checklist item opens. */
export const RELEASE_HEALTH_TARGET: Record<
  StudioReleaseHealthKey,
  { step: "release" | "tracks"; field: keyof typeof RELEASE_FIELD_IDS }
> = {
  cover: { step: "release", field: "cover" },
  description: { step: "release", field: "description" },
  genreAndMood: { step: "release", field: "genre" },
  creditsOnEveryTrack: { step: "tracks", field: "trackCredits" },
  lyrics: { step: "tracks", field: "tracks" },
  buyLink: { step: "release", field: "buyUrl" },
  versionNote: { step: "tracks", field: "versionNote" },
};

export const RELEASE_HEALTH_TODO_KEY: Record<StudioReleaseHealthKey, string> = {
  cover: "studio:numbers.health.todo.cover",
  description: "studio:numbers.health.todo.description",
  genreAndMood: "studio:numbers.health.todo.genreAndMood",
  creditsOnEveryTrack: "studio:numbers.health.todo.creditsOnEveryTrack",
  lyrics: "studio:numbers.health.todo.lyrics",
  buyLink: "studio:numbers.health.todo.buyLink",
  versionNote: "studio:numbers.health.todo.versionNote",
};

export const RELEASE_HEALTH_DONE_KEY: Record<StudioReleaseHealthKey, string> = {
  cover: "studio:numbers.health.done.cover",
  description: "studio:numbers.health.done.description",
  genreAndMood: "studio:numbers.health.done.genreAndMood",
  creditsOnEveryTrack: "studio:numbers.health.done.creditsOnEveryTrack",
  lyrics: "studio:numbers.health.done.lyrics",
  buyLink: "studio:numbers.health.done.buyLink",
  versionNote: "studio:numbers.health.done.versionNote",
};

/** The checklist rows shown before the "Show more releases" toggle. */
export const RELEASE_HEALTH_ROWS_SHOWN = 3;

/** The release editor, on the step and field that fixes this item. */
export function releaseHealthFixHref(
  releaseId: string,
  key: StudioReleaseHealthKey,
): string {
  const target = RELEASE_HEALTH_TARGET[key];
  return studioReleaseFieldPath(
    releaseId,
    target.step,
    RELEASE_FIELD_IDS[target.field],
  );
}

/** Every release with an open item, optional ones included, whatever its
 *  status, in the server's order. A taken-down release has no items. */
export function releasesNeedingWorkOf(
  releases: StudioDashboardReleaseView[],
): StudioDashboardReleaseView[] {
  return releases.filter((releaseRow) => releaseRow.health.hasOpenItems);
}
