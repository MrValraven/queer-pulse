import type {
  StudioArtistRefView,
  StudioReleaseView,
} from "./api/studio.adapters";
import {
  STUDIO_GENRES,
  STUDIO_LIMITS,
  STUDIO_RELEASE_TYPES_BY_KIND,
  type StudioGenre,
  type StudioReleaseType,
  type UpdateStudioReleaseBody,
} from "./api/studio.types";

export type UploadStepId = "release" | "tracks" | "publish";

export interface ReleaseFormValues {
  subprofileId: string;
  type: StudioReleaseType;
  title: string;
  genre: StudioGenre | "";
  /** "" or YYYY-MM-DD. Empty defaults to the publish date server-side. */
  releasedOn: string;
  description: string;
  /** A cover picked this session; null keeps the saved one. */
  coverKey: string | null;
}

const KNOWN_GENRES: ReadonlySet<string> = new Set(STUDIO_GENRES);

export function defaultReleaseForm(
  persona: StudioArtistRefView | undefined,
): ReleaseFormValues {
  const kind = persona?.kind ?? "musician";
  return {
    subprofileId: persona?.id ?? "",
    type: STUDIO_RELEASE_TYPES_BY_KIND[kind][0] ?? "single",
    title: "",
    genre: "",
    releasedOn: "",
    description: "",
    coverKey: null,
  };
}

export function formFromRelease(release: StudioReleaseView): ReleaseFormValues {
  return {
    subprofileId: release.artist.id,
    type: release.type,
    title: release.title,
    genre:
      release.genre && KNOWN_GENRES.has(release.genre)
        ? (release.genre as StudioGenre)
        : "",
    releasedOn: release.releasedOn ?? "",
    description: release.description ?? "",
    coverKey: null,
  };
}

export function releaseFormErrors(form: ReleaseFormValues): {
  title?: string;
  description?: string;
} {
  const errors: { title?: string; description?: string } = {};
  const title = form.title.trim();
  if (title.length === 0)
    errors.title = "studio:uploadFlow.release.titleRequired";
  else if (title.length > STUDIO_LIMITS.titleMax)
    errors.title = "studio:uploadFlow.release.titleTooLong";
  if (form.description.length > STUDIO_LIMITS.descriptionMax) {
    errors.description = "studio:uploadFlow.release.descriptionTooLong";
  }
  return errors;
}

/** Only what changed since the last save, trimmed, empties as null. A saved
 *  genre outside STUDIO_GENRES reads as "" in the form and stays as it is. */
export function patchFromForm(
  form: ReleaseFormValues,
  release: StudioReleaseView,
): UpdateStudioReleaseBody {
  const body: UpdateStudioReleaseBody = {};
  const title = form.title.trim();
  if (title && title !== release.title) body.title = title;
  if (form.type !== release.type) body.type = form.type;
  const genre = form.genre || null;
  const hasUnlistedGenre =
    release.genre !== null && !KNOWN_GENRES.has(release.genre);
  if (genre !== release.genre && !(genre === null && hasUnlistedGenre))
    body.genre = genre;
  const releasedOn = form.releasedOn || null;
  if (releasedOn !== release.releasedOn) body.releasedOn = releasedOn;
  const description = form.description.trim() || null;
  const savedDescription = release.description?.trim() || null;
  if (description !== savedDescription) body.description = description;
  if (form.coverKey) body.coverKey = form.coverKey;
  return body;
}
