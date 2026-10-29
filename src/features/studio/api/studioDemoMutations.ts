import type {
  CreateStudioReleaseBody,
  StudioReleaseType,
  UpdateStudioReleaseBody,
  UpdateStudioTrackBody,
} from "./studio.types";
import {
  STUDIO_SCHEDULE_MAX_LEAD_DAYS,
  STUDIO_SCHEDULE_MIN_LEAD_MINUTES,
  STUDIO_SCHEDULE_TIME_ZONE,
} from "./studio.types";
import { ApiError } from "../../../shared/api/client";
import { studioTrackPath } from "../studioPaths";
import {
  STUDIO_RELEASE_STATUS_LABEL_KEY,
  STUDIO_RELEASE_TYPE_LABEL_KEY,
  formatTrackTime,
  genreLabelKeyOf,
  lyricStanzasOf,
  studioSavedId,
  toBuyLinkView,
  toChapterViews,
  toReleaseCardView,
  toSceneRefView,
  toSources,
  toSyncedLyricViews,
  type StudioReleaseCardView,
  type StudioReleaseView,
  type StudioTrackView,
} from "./studio.adapters";
import { notesExcerpt } from "./studioEpisodes";
import {
  demoApplyListeningPatch,
  demoConfirmNewAudio,
} from "./studioDemoListening";
import { demoRevokePreviewLink } from "./studioDemoArtistTools";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import {
  demoEffectiveWarnings,
  demoIsExplicitLocked,
  demoSetArtistWarnings,
} from "./studioDemoSafety";
import { demoSceneRefById } from "./studioDemoScenes.data";
import { defaultGenresForKind } from "../studioUploadGenres.data";
import { isSellableReleaseType } from "../studioPurchaseRules";
import { demoTrackPriceOf } from "./studioDemoPurchaseStore";
import {
  demoSetReleasePrice,
  demoSetTrackPrice,
} from "./studioDemoPurchasePrices";

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
  // Spoken word personas start on Spoken word, as the server does.
  const spokenWordGenres: string[] = defaultGenresForKind(persona.kind);
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
    genre: spokenWordGenres[0] ?? null,
    genres: spokenWordGenres,
    mood: null,
    scene: null,
  });
  return {
    ...card,
    description: null,
    status: "draft",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.draft,
    isOwner: true,
    tracks: [],
    ownerTracks: [],
    playableTrackCount: 0,
    rightsConfirmedAt: null,
    takedownReason: null,
    dispute: null,
    canDispute: false,
    sceneId: null,
    personaCredits: [],
    publishAt: null,
    isUpcoming: false,
    buyUrl: null,
    buyLink: null,
    isGapless: false,
    price: null,
    supportLinks: [],
    version: 1,
    versions: [],
    latestVersion: null,
    isReminderSet: false,
    isPreview: false,
    hasUnnotedChanges: false,
    previewToken: null,
    previewLinkCreatedAt: null,
  };
}

export function demoUpdateRelease(
  release: StudioReleaseView,
  body: UpdateStudioReleaseBody,
): StudioReleaseView {
  const type: StudioReleaseType = body.type ?? release.type;
  const genres = body.genres === undefined ? release.genres : body.genres;
  const mood = body.mood === undefined ? release.mood : body.mood;
  const sceneId = body.sceneId === undefined ? release.sceneId : body.sceneId;
  // Studio purchases: the refusals throw before anything changes. A type
  // change out of the sellable types needs every price on the release off
  // first (its tracks included).
  const priceAfter = body.price === undefined ? release.price : body.price;
  const isPricedInside =
    priceAfter !== null ||
    release.tracks.some((track) => demoTrackPriceOf(track.id) !== null);
  if (
    body.type !== undefined &&
    !isSellableReleaseType(type) &&
    isPricedInside
  ) {
    throw studioRefusal(409, "studio_release_type_not_for_sale");
  }
  if (body.price !== undefined) {
    demoSetReleasePrice(release.id, body.price, {
      releaseType: type,
      artistId: release.artist.id,
    });
  }
  return {
    ...release,
    ...(body.price === undefined
      ? {}
      : { price: body.price === null ? null : body.price }),
    title: body.title ?? release.title,
    type,
    typeLabelKey: STUDIO_RELEASE_TYPE_LABEL_KEY[type],
    description:
      body.description === undefined ? release.description : body.description,
    genre: genres[0] ?? null,
    genreLabelKey: genreLabelKeyOf(genres[0] ?? null),
    genres,
    genreLabelKeys: genres.flatMap((genre) => {
      const labelKey = genreLabelKeyOf(genre);
      return labelKey === null ? [] : [labelKey];
    }),
    mood,
    sceneId,
    scene:
      body.sceneId === undefined
        ? release.scene
        : toSceneRefView(sceneId ? demoSceneRefById(sceneId) : null),
    releasedOn:
      body.releasedOn === undefined ? release.releasedOn : body.releasedOn,
    releaseYear: (body.releasedOn ?? release.releasedOn)?.slice(0, 4) ?? null,
    coverUrl: body.coverKey === undefined ? release.coverUrl : body.coverKey,
    rightsConfirmedAt: body.rightsConfirmed
      ? new Date().toISOString()
      : release.rightsConfirmedAt,
    buyUrl: body.buyUrl === undefined ? release.buyUrl : body.buyUrl,
    buyLink:
      body.buyUrl === undefined ? release.buyLink : toBuyLinkView(body.buyUrl),
    isGapless: body.isGapless ?? release.isGapless,
  };
}

export function demoCreateTrack(
  releaseId: string,
  title: string,
  position: number,
  /** The cached release, when the caller has it: a new track on a podcast
   *  show is a draft episode (spec 4.1). */
  ownerRelease?: StudioReleaseCardView,
): StudioTrackView {
  const id = nextDemoId("demo-track");
  const release =
    ownerRelease ??
    toReleaseCardView({
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
      genres: [],
      mood: null,
      scene: null,
    });
  const isDraftEpisode = release.isShow;
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
    publishedAt: null,
    isDraft: isDraftEpisode,
    notesExcerpt: null,
    releaseId,
    credits: [],
    lyricStanzas: [],
    notes: null,
    sources: [],
    syncedLyrics: null,
    chapters: null,
    release,
    personaCredits: [],
  };
}

export function demoUpdateTrack(
  track: StudioTrackView,
  body: UpdateStudioTrackBody,
): StudioTrackView {
  // The server's listening rules first: a refusal throws before anything
  // changes.
  // Studio safety: our team's explicit mark holds, as the server's 409.
  if (body.isExplicit === false && demoIsExplicitLocked(track.id))
    throw studioRefusal(409, "studio_track_explicit_locked");
  if (body.price !== undefined) {
    demoSetTrackPrice(track.id, body.price, {
      releaseType: track.release.type,
      artistId: track.release.artist.id,
    });
  }
  const stored = demoApplyListeningPatch(track, body);
  if (body.contentWarnings !== undefined)
    demoSetArtistWarnings(track.id, body.contentWarnings);
  const notes =
    body.notes === undefined ? track.notes : body.notes?.trim() || null;
  return {
    ...track,
    title: body.title ?? track.title,
    isExplicit: body.isExplicit ?? track.isExplicit,
    contentWarnings: demoEffectiveWarnings(track.id),
    credits: body.credits ?? track.credits,
    lyricStanzas:
      body.lyrics === undefined
        ? track.lyricStanzas
        : lyricStanzasOf(body.lyrics),
    notes,
    notesExcerpt: notesExcerpt(notes),
    sources:
      body.sources === undefined ? track.sources : toSources(body.sources),
    syncedLyrics:
      body.syncedLyrics === undefined
        ? track.syncedLyrics
        : toSyncedLyricViews(stored.syncedLyrics ?? null),
    chapters:
      body.chapters === undefined
        ? track.chapters
        : toChapterViews(stored.chapters ?? null),
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
  // New audio clears the measurements and drops chapters that no longer fit.
  const keptChapters = demoConfirmNewAudio(track.id, durationSeconds);
  return {
    ...track,
    hasAudio: true,
    durationSeconds,
    durationLabel: formatTrackTime(durationSeconds),
    chapters: toChapterViews(keptChapters),
  };
}

/** POST /studio/tracks/:id/publish in the demo: the episode goes live now.
 *  The server's refusals the demo can see, in its order: an episode already
 *  live, then one without confirmed audio. */
export function demoPublishEpisode(track: StudioTrackView): StudioTrackView {
  if (track.publishedAt)
    throw studioRefusal(409, "studio_episode_already_published");
  if (!track.hasAudio)
    throw studioRefusal(409, "studio_publish_tracks_pending");
  return { ...track, isDraft: false, publishedAt: new Date().toISOString() };
}

export function demoReorder(
  release: StudioReleaseView,
  trackIds: string[],
): StudioReleaseView {
  const reorder = <Row extends { id: string; position: number }>(
    rows: Row[],
  ) => {
    const byId = new Map(rows.map((row) => [row.id, row]));
    return trackIds
      .map((trackId) => byId.get(trackId))
      .filter((row): row is Row => row !== undefined)
      .map((row, index) => ({ ...row, position: index + 1 }));
  };
  // A track change on a published release waits for a version note.
  return {
    ...release,
    tracks: reorder(release.tracks),
    ownerTracks: release.ownerTracks ? reorder(release.ownerTracks) : null,
    hasUnnotedChanges:
      release.hasUnnotedChanges || release.status === "published",
  };
}

/** Publish, or Publish now on a scheduled release: publishAt clears, and an
 *  empty release date, or one that scheduling filled, becomes today in
 *  Lisbon. */
export function demoPublish(release: StudioReleaseView): StudioReleaseView {
  const now = new Date().toISOString();
  const releasedOn =
    release.releasedOn === null || wasFilledByScheduling(release)
      ? lisbonDateOf(now)
      : release.releasedOn;
  // Artist kinds: publishing a show stamps every episode playable now
  // (spec 4.1); the others stay drafts.
  const stampEpisodes = <Row extends EpisodeStampRow>(rows: Row[]): Row[] =>
    release.isShow
      ? rows.map((track) =>
          track.hasAudio && !track.publishedAt
            ? { ...track, publishedAt: now, isDraft: false }
            : track,
        )
      : rows;
  return {
    ...release,
    status: "published",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.published,
    publishedAt: now,
    releasedOn,
    releaseYear: releasedOn.slice(0, 4),
    publishAt: null,
    isUpcoming: false,
    tracks: stampEpisodes(release.tracks),
    ownerTracks: release.ownerTracks
      ? stampEpisodes(release.ownerTracks)
      : null,
  };
}

/** The row fields the show stamp reads; a missing value reads as unset. */
interface EpisodeStampRow {
  hasAudio: boolean;
  publishedAt?: string | null;
  isDraft?: boolean;
}

/** The server clears the preview link on unpublish and on takedown. The demo
 *  link store drops its entry with the two fields on the view. */
function withoutPreviewLink(release: StudioReleaseView): StudioReleaseView {
  demoRevokePreviewLink(release.id);
  return { ...release, previewToken: null, previewLinkCreatedAt: null };
}

/** Unpublish changes only a published release and clears its preview link.
 *  A draft or scheduled release comes back unchanged, and a taken-down one
 *  is refused, as the server answers. */
export function demoUnpublish(release: StudioReleaseView): StudioReleaseView {
  if (release.status === "taken_down")
    throw studioRefusal(409, "studio_release_not_draft");
  if (release.status !== "published") return release;
  return {
    ...withoutPreviewLink(release),
    status: "draft",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.draft,
    publishedAt: null,
  };
}

/** A staff takedown or restore on the demo view. Leaving the scheduled
 *  state clears publishAt (and a releasedOn that scheduling filled), and the
 *  preview link goes; a restore returns nothing upcoming and no link. */
export function demoWithdrawalStatus(
  release: StudioReleaseView,
  status: "taken_down" | "published" | "draft",
): StudioReleaseView {
  const releasedOn = wasFilledByScheduling(release) ? null : release.releasedOn;
  return {
    ...withoutPreviewLink(release),
    status,
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY[status],
    publishAt: null,
    isUpcoming: false,
    releasedOn,
    releaseYear: releasedOn?.slice(0, 4) ?? null,
  };
}

/** A refusal shaped as the server sends it, so the error lines resolve. */
export function studioRefusal(status: number, code: string): ApiError {
  return new ApiError(status, code, {
    statusCode: status,
    code,
    message: code,
  });
}

/** YYYY-MM-DD of an instant in Lisbon, as the server fills releasedOn. */
export function lisbonDateOf(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_SCHEDULE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** The release date is the one scheduling filled (the Lisbon date of its
 *  publish time). A typed date stays as the artist wrote it. */
function wasFilledByScheduling(release: StudioReleaseView): boolean {
  return (
    release.publishAt !== null &&
    release.releasedOn === lisbonDateOf(release.publishAt)
  );
}

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

/** POST /studio/releases/:id/schedule in the demo: the server's status and
 *  window rules, then the scheduled release. */
export function demoSchedule(
  release: StudioReleaseView,
  publishAt: string,
): StudioReleaseView {
  if (release.status !== "draft" && release.status !== "scheduled")
    throw studioRefusal(409, "studio_release_not_schedulable");
  const leadMs = Date.parse(publishAt) - Date.now();
  if (
    !(leadMs >= STUDIO_SCHEDULE_MIN_LEAD_MINUTES * MINUTE_MS) ||
    leadMs > STUDIO_SCHEDULE_MAX_LEAD_DAYS * DAY_MS
  )
    throw studioRefusal(422, "studio_schedule_out_of_range");
  // A date scheduling filled moves with a reschedule; a typed one stays.
  const releasedOn =
    release.releasedOn === null || wasFilledByScheduling(release)
      ? lisbonDateOf(publishAt)
      : release.releasedOn;
  return {
    ...release,
    status: "scheduled",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.scheduled,
    publishAt,
    isUpcoming: true,
    releasedOn,
    releaseYear: releasedOn.slice(0, 4),
  };
}

/** Back to a draft. Reminders stay with the release as the server keeps
 *  them, so isReminderSet is left as it was. A draft comes back unchanged;
 *  a published or taken-down release is refused. A release date that
 *  scheduling filled clears. */
export function demoUnschedule(release: StudioReleaseView): StudioReleaseView {
  if (release.status === "draft") return release;
  if (release.status !== "scheduled")
    throw studioRefusal(409, "studio_release_not_schedulable");
  const releasedOn = wasFilledByScheduling(release) ? null : release.releasedOn;
  return {
    ...release,
    status: "draft",
    statusLabelKey: STUDIO_RELEASE_STATUS_LABEL_KEY.draft,
    publishAt: null,
    isUpcoming: false,
    releasedOn,
    releaseYear: releasedOn?.slice(0, 4) ?? null,
  };
}

/** POST /studio/releases/:id/versions in the demo: a published release with
 *  a track change since the last note. */
export function demoAddVersion(
  release: StudioReleaseView,
  note: string,
): StudioReleaseView {
  if (release.status === "taken_down")
    throw studioRefusal(409, "studio_release_not_draft");
  if (release.status !== "published" || !release.hasUnnotedChanges)
    throw studioRefusal(409, "studio_release_no_changes");
  const entry = {
    version: release.version + 1,
    note: note.trim(),
    createdAt: new Date().toISOString(),
  };
  return {
    ...release,
    version: entry.version,
    versions: [entry, ...release.versions],
    latestVersion: entry,
    hasUnnotedChanges: false,
  };
}

/** A token in the server's format (64 hex characters). */
export function demoPreviewToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
