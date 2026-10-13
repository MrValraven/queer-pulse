import type {
  CreateStudioReleaseBody,
  StudioReleaseType,
  UpdateStudioReleaseBody,
  UpdateStudioTrackBody,
} from "./studio.types";
import { studioTrackPath } from "../studioPaths";
import {
  STUDIO_GENRE_LABEL_KEY,
  STUDIO_RELEASE_STATUS_LABEL_KEY,
  STUDIO_RELEASE_TYPE_LABEL_KEY,
  formatTrackTime,
  lyricStanzasOf,
  studioSavedId,
  toReleaseCardView,
  type StudioReleaseView,
  type StudioTrackView,
} from "./studio.adapters";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import type { StudioGenre } from "./studio.types";

/** A rough 128 kbps estimate, read back from the demo key's byte count. */
const DEMO_BYTES_PER_SECOND = 16_000;
let demoSequence = 0;
const nextDemoId = (prefix: string) =>
  `${prefix}-${Date.now()}-${(demoSequence += 1)}`;

export function demoCreateRelease(
  body: CreateStudioReleaseBody,
): StudioReleaseView {
  const persona =
    DEMO_STUDIO_ME.uploadablePersonas.find(
      (candidate) => candidate.id === body.subprofileId,
    ) ?? DEMO_STUDIO_ME.uploadablePersonas[0]!;
  const card = toReleaseCardView({
    id: nextDemoId("demo-draft"),
    title: body.title,
    type: body.type,
    coverUrl: null,
    releasedOn: null,
    trackCount: 0,
    totalDurationSeconds: 0,
    artist: persona,
    publishedAt: null,
    genre: null,
  });
  return {
    ...card,
    description: null,
    status: "draft",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.draft,
    isOwner: true,
    tracks: [],
    playableTrackCount: 0,
    rightsConfirmedAt: null,
    takedownReason: null,
  };
}

export function demoUpdateRelease(
  release: StudioReleaseView,
  body: UpdateStudioReleaseBody,
): StudioReleaseView {
  const type: StudioReleaseType = body.type ?? release.type;
  const genre = body.genre === undefined ? release.genre : body.genre;
  return {
    ...release,
    title: body.title ?? release.title,
    type,
    typeLabelKey: STUDIO_RELEASE_TYPE_LABEL_KEY[type],
    description:
      body.description === undefined ? release.description : body.description,
    genre,
    genreLabelKey: genre
      ? (STUDIO_GENRE_LABEL_KEY[genre as StudioGenre] ?? null)
      : null,
    releasedOn:
      body.releasedOn === undefined ? release.releasedOn : body.releasedOn,
    releaseYear: (body.releasedOn ?? release.releasedOn)?.slice(0, 4) ?? null,
    coverUrl: body.coverKey === undefined ? release.coverUrl : body.coverKey,
    rightsConfirmedAt: body.rightsConfirmed
      ? new Date().toISOString()
      : release.rightsConfirmedAt,
  };
}

export function demoCreateTrack(
  releaseId: string,
  title: string,
  position: number,
): StudioTrackView {
  const id = nextDemoId("demo-track");
  const release = toReleaseCardView({
    id: releaseId,
    title: "",
    type: "single",
    coverUrl: null,
    releasedOn: null,
    trackCount: 0,
    totalDurationSeconds: 0,
    artist: DEMO_STUDIO_ME.uploadablePersonas[0]!,
    publishedAt: null,
    genre: null,
  });
  return {
    id,
    position,
    title,
    durationSeconds: null,
    durationLabel: null,
    isExplicit: false,
    hasAudio: false,
    href: studioTrackPath(id),
    savedId: studioSavedId.track(id),
    releaseId,
    credits: [],
    lyricStanzas: [],
    release,
  };
}

export function demoUpdateTrack(
  track: StudioTrackView,
  body: UpdateStudioTrackBody,
): StudioTrackView {
  return {
    ...track,
    title: body.title ?? track.title,
    isExplicit: body.isExplicit ?? track.isExplicit,
    credits: body.credits ?? track.credits,
    lyricStanzas:
      body.lyrics === undefined
        ? track.lyricStanzas
        : lyricStanzasOf(body.lyrics),
  };
}

export function demoConfirmAudio(
  track: StudioTrackView,
  key: string,
): StudioTrackView {
  const byteCount = Number(key.split(":")[1] ?? "0");
  const durationSeconds = Math.max(
    30,
    Math.round(byteCount / DEMO_BYTES_PER_SECOND),
  );
  return {
    ...track,
    hasAudio: true,
    durationSeconds,
    durationLabel: formatTrackTime(durationSeconds),
  };
}

export function demoReorder(
  release: StudioReleaseView,
  trackIds: string[],
): StudioReleaseView {
  const byId = new Map(release.tracks.map((track) => [track.id, track]));
  const tracks = trackIds
    .map((trackId) => byId.get(trackId))
    .filter((track): track is NonNullable<typeof track> => track !== undefined)
    .map((track, index) => ({ ...track, position: index + 1 }));
  return { ...release, tracks };
}

export function demoPublish(release: StudioReleaseView): StudioReleaseView {
  return {
    ...release,
    status: "published",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.published,
    publishedAt: new Date().toISOString(),
    releasedOn: release.releasedOn ?? new Date().toISOString().slice(0, 10),
  };
}

export function demoUnpublish(release: StudioReleaseView): StudioReleaseView {
  return {
    ...release,
    status: "draft",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.draft,
    publishedAt: null,
  };
}
