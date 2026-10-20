import type {
  StudioArtistRefView,
  StudioReleaseView,
} from "./api/studio.adapters";
import {
  STUDIO_BUY_URL_MAX,
  STUDIO_FORMAT_BY_KIND,
  STUDIO_GENRES,
  STUDIO_LIMITS,
  STUDIO_RELEASE_TYPES_BY_KIND,
  type StudioArtistPersonaKind,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
  type StudioReleaseType,
  type UpdateStudioReleaseBody,
} from "./api/studio.types";

export type UploadStepId = "release" | "tracks" | "publish";

export interface ReleaseFormValues {
  subprofileId: string;
  type: StudioReleaseType;
  title: string;
  genre: StudioGenre | "";
  /** Discovery: "" for none. */
  mood: StudioMood | "";
  /** Discovery: the scene id, "" for none. */
  sceneId: string;
  /** "" or YYYY-MM-DD. Empty defaults to the publish date server-side. */
  releasedOn: string;
  description: string;
  /** A cover picked this session; null keeps the saved one. */
  coverKey: string | null;
  /** Studio v3: "" or an https link to buy the release. */
  buyUrl: string;
  /** Play the tracks straight on, without a crossfade between them. */
  isGapless: boolean;
}

const KNOWN_GENRES: ReadonlySet<string> = new Set(STUDIO_GENRES);

/** Artist kinds: poet and spoken word releases start on Spoken word (spec
 *  4.6); everyone else starts with no genre. */
export function defaultGenreForKind(
  kind: StudioArtistPersonaKind | undefined,
): StudioGenre | "" {
  return kind && STUDIO_FORMAT_BY_KIND[kind] === "spoken_word"
    ? "spoken-word"
    : "";
}

export interface ReleaseFieldCopy {
  titleLabelKey: string;
  descriptionLabelKey: string;
  /** Genre, mood and scene; a show carries none (spec 6.1). */
  isGenreShown: boolean;
}

export function releaseFieldCopyOf(format: StudioFormat): ReleaseFieldCopy {
  return format === "podcast"
    ? {
        titleLabelKey: "studio:uploadFlow.release.showNameLabel",
        descriptionLabelKey: "studio:uploadFlow.release.showAboutLabel",
        isGenreShown: false,
      }
    : {
        titleLabelKey: "studio:upload.metadata.field.title",
        descriptionLabelKey: "studio:uploadFlow.release.descriptionLabel",
        isGenreShown: true,
      };
}

/** The fields a persona switch resets: its first type, its genre preset (a
 *  spoken word persona's, or none when leaving one), and an empty genre,
 *  mood and scene for a show, which carries none of them. A show also
 *  plays with gaps between its episodes, so the gapless mark turns off. */
export function personaSwitchPatch(
  kind: StudioArtistPersonaKind,
  current: ReleaseFormValues,
): Pick<
  ReleaseFormValues,
  "type" | "genre" | "mood" | "sceneId" | "isGapless"
> {
  const isGenreShown = releaseFieldCopyOf(
    STUDIO_FORMAT_BY_KIND[kind],
  ).isGenreShown;
  const presetGenre = defaultGenreForKind(kind);
  let genre = current.genre;
  if (!isGenreShown) genre = "";
  else if (presetGenre) genre = presetGenre;
  else if (genre === "spoken-word") genre = "";
  return {
    type: STUDIO_RELEASE_TYPES_BY_KIND[kind][0] ?? "album",
    genre,
    mood: isGenreShown ? current.mood : "",
    sceneId: isGenreShown ? current.sceneId : "",
    isGapless: isGenreShown ? current.isGapless : false,
  };
}

export function defaultReleaseForm(
  persona: StudioArtistRefView | undefined,
): ReleaseFormValues {
  return {
    subprofileId: persona?.id ?? "",
    type: persona
      ? (STUDIO_RELEASE_TYPES_BY_KIND[persona.kind][0] ?? "album")
      : "album",
    title: "",
    genre: defaultGenreForKind(persona?.kind),
    mood: "",
    sceneId: "",
    releasedOn: "",
    description: "",
    coverKey: null,
    buyUrl: "",
    isGapless: false,
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
    mood: release.mood ?? "",
    sceneId: release.sceneId ?? "",
    releasedOn: release.releasedOn ?? "",
    description: release.description ?? "",
    coverKey: null,
    buyUrl: release.buyUrl ?? "",
    isGapless: release.isGapless,
  };
}

const isHttpsLink = (value: string) => {
  if (!/^https:\/\//i.test(value)) return false;
  try {
    return Boolean(new URL(value).hostname);
  } catch {
    return false;
  }
};

export function releaseFormErrors(form: ReleaseFormValues): {
  title?: string;
  description?: string;
  buyUrl?: string;
} {
  const errors: { title?: string; description?: string; buyUrl?: string } = {};
  const title = form.title.trim();
  if (title.length === 0)
    errors.title = "studio:uploadFlow.release.titleRequired";
  else if (title.length > STUDIO_LIMITS.titleMax)
    errors.title = "studio:uploadFlow.release.titleTooLong";
  if (form.description.length > STUDIO_LIMITS.descriptionMax) {
    errors.description = "studio:uploadFlow.release.descriptionTooLong";
  }
  const buyUrl = form.buyUrl.trim();
  if (buyUrl.length > STUDIO_BUY_URL_MAX)
    errors.buyUrl = "studio:uploadFlow.v3.buyUrlTooLong";
  else if (buyUrl && !isHttpsLink(buyUrl))
    errors.buyUrl = "studio:uploadFlow.v3.buyUrlHttpsOnly";
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
  const mood = form.mood || null;
  if (mood !== release.mood) body.mood = mood;
  const sceneId = form.sceneId || null;
  if (sceneId !== release.sceneId) body.sceneId = sceneId;
  const releasedOn = form.releasedOn || null;
  if (releasedOn !== release.releasedOn) body.releasedOn = releasedOn;
  const description = form.description.trim() || null;
  const savedDescription = release.description?.trim() || null;
  if (description !== savedDescription) body.description = description;
  const trimmedBuyUrl = form.buyUrl.trim();
  const buyUrl = trimmedBuyUrl
    ? trimmedBuyUrl.replace(/^https:\/\//i, "https://")
    : null;
  if (buyUrl !== release.buyUrl) body.buyUrl = buyUrl;
  if (form.isGapless !== release.isGapless) body.isGapless = form.isGapless;
  if (form.coverKey) body.coverKey = form.coverKey;
  return body;
}
