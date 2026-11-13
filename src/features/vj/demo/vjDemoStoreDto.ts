/**
 * The demo VJ library's DTO projection (C 6.1): packs with their event
 * summary, clips with their page-life preview and set list step count,
 * scenes with their set list count, set lists with Loop, the default length
 * and their steps, and the event option and card of a demo event fixture. Positions are array indexes. Kept apart from
 * `vjDemoStorePersistence.ts`, which never imports it, so there is no cycle.
 */
import type {
  VjClipDTO,
  VjEventCardDTO,
  VjEventOptionDTO,
  VjPackClipsDTO,
  VjPackDTO,
  VjPackEventSummaryDTO,
  VjPackListDTO,
  VjSceneDTO,
  VjSceneListDTO,
  VjSetlistDTO,
  VjSetlistItemDTO,
  VjSetlistListDTO,
} from "../../../shared/contracts/vj";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import { VJ_DEMO_EVENTS, type VjDemoEventFixture } from "./vjDemoEvents.data";
import { normalizeStoredVjSceneLook } from "./vjDemoSceneLook";
import {
  clipsOfVjDemoPack,
  isoAt,
  packIdsOfVjDemoClip,
  vjDemoNow,
  type StoredVjDemoClip,
  type StoredVjDemoLibrary,
  type StoredVjDemoPack,
  type StoredVjDemoScene,
  type StoredVjDemoSetlist,
  type StoredVjDemoSetlistItem,
} from "./vjDemoStorePersistence";

/** Clip id to an in-memory blob URL; lives for the page's life and is never
 *  persisted, so `previewUrl` reads null after a reload (C 9.5). */
const previewUrlByClipId = new Map<string, string>();

/** Frees a replaced or forgotten preview's blob, the way live deletes the
 *  replaced object. Only `blob:` URLs hold memory; jsdom has no revoke. */
function releasePreviewUrl(url: string | undefined): void {
  if (url === undefined || !url.startsWith("blob:")) return;
  if (typeof URL.revokeObjectURL !== "function") return;
  URL.revokeObjectURL(url);
}

export function setVjDemoPreviewUrl(clipId: string, url: string): void {
  const previousUrl = previewUrlByClipId.get(clipId);
  previewUrlByClipId.set(clipId, url);
  if (previousUrl !== url) releasePreviewUrl(previousUrl);
}

export function vjDemoPreviewUrlOf(clipId: string): string | null {
  return previewUrlByClipId.get(clipId) ?? null;
}

export function forgetVjDemoPreviewUrl(clipId: string): void {
  const previousUrl = previewUrlByClipId.get(clipId);
  previewUrlByClipId.delete(clipId);
  releasePreviewUrl(previousUrl);
}

/** The demo event fixture with this id; null when none has it. */
export function vjDemoEventFixtureOf(
  eventId: string | null,
): VjDemoEventFixture | null {
  if (eventId === null) return null;
  return VJ_DEMO_EVENTS.find((fixture) => fixture.id === eventId) ?? null;
}

function startAtOf(fixture: VjDemoEventFixture, now: number): string {
  return isoAt(now + fixture.startOffsetMs);
}

function endAtOf(fixture: VjDemoEventFixture, now: number): string | null {
  return fixture.durationMs === null
    ? null
    : isoAt(now + fixture.startOffsetMs + fixture.durationMs);
}

export function toVjDemoEventOptionDto(
  fixture: VjDemoEventFixture,
  now: number,
): VjEventOptionDTO {
  return {
    id: fixture.id,
    title: fixture.title,
    startAt: startAtOf(fixture, now),
    endAt: endAtOf(fixture, now),
    area: fixture.area,
    isOnline: fixture.isOnline,
  };
}

/** The card, its public URL built at read time from this tab's origin; null
 *  where there is no window. */
export function toVjDemoEventCardDto(
  fixture: VjDemoEventFixture,
  now: number,
): VjEventCardDTO {
  return {
    eventId: fixture.id,
    title: fixture.title,
    startAt: startAtOf(fixture, now),
    endAt: endAtOf(fixture, now),
    timezone: fixture.timezone,
    area: fixture.area,
    isOnline: fixture.isOnline,
    publicUrl:
      typeof window === "undefined"
        ? null
        : `${window.location.origin}${gatheringPath(fixture.slug)}`,
  };
}

/** Every demo fixture is linkable, so a known one is always available. */
function packEventSummaryOf(
  pack: StoredVjDemoPack,
): VjPackEventSummaryDTO | null {
  const fixture = vjDemoEventFixtureOf(pack.eventId);
  if (fixture === null) return null;
  return {
    id: fixture.id,
    title: fixture.title,
    startAt: startAtOf(fixture, vjDemoNow()),
    isAvailable: true,
  };
}

export function toVjDemoPackDto(
  library: StoredVjDemoLibrary,
  pack: StoredVjDemoPack,
): VjPackDTO {
  const packClips = clipsOfVjDemoPack(library, pack);
  return {
    id: pack.id,
    name: pack.name,
    position: library.packs.indexOf(pack),
    clipCount: packClips.length,
    totalByteSize: packClips.reduce((total, clip) => total + clip.byteSize, 0),
    coverThumbnailUrl: packClips[0]?.thumbnailUrl ?? null,
    createdBy: pack.createdBy,
    createdAt: pack.createdAt,
    updatedAt: pack.updatedAt,
    event: packEventSummaryOf(pack),
  };
}

/** How many set list steps, across every set list, match `isMatch`. */
function countSetlistItems(
  library: StoredVjDemoLibrary,
  isMatch: (item: StoredVjDemoSetlistItem) => boolean,
): number {
  return library.setlists.reduce(
    (count, setlist) => count + setlist.items.filter(isMatch).length,
    0,
  );
}

export function toVjDemoClipDto(
  library: StoredVjDemoLibrary,
  clip: StoredVjDemoClip,
): VjClipDTO {
  const packIds = packIdsOfVjDemoClip(library, clip.id);
  return {
    ...clip,
    packIds,
    packCount: packIds.length,
    setlistItemCount: countSetlistItems(
      library,
      (item) => item.clipId === clip.id,
    ),
    previewUrl: vjDemoPreviewUrlOf(clip.id),
  };
}

export function toVjDemoPackClipsDto(
  library: StoredVjDemoLibrary,
  pack: StoredVjDemoPack,
): VjPackClipsDTO {
  return {
    pack: toVjDemoPackDto(library, pack),
    items: clipsOfVjDemoPack(library, pack).map((clip) =>
      toVjDemoClipDto(library, clip),
    ),
  };
}

export function toVjDemoPackListDto(
  library: StoredVjDemoLibrary,
): VjPackListDTO {
  return {
    items: library.packs.map((pack) => toVjDemoPackDto(library, pack)),
  };
}

/** The look goes through the read normaliser (C 3.7), so an effect the
 *  catalog no longer has drops out. */
export function toVjDemoSceneDto(
  library: StoredVjDemoLibrary,
  scene: StoredVjDemoScene,
): VjSceneDTO {
  const setlistItemCount = countSetlistItems(
    library,
    (item) => item.sceneId === scene.id,
  );
  return {
    id: scene.id,
    name: scene.name,
    packId: scene.packId,
    position: library.scenes.indexOf(scene),
    look: normalizeStoredVjSceneLook(scene.look),
    setlistItemCount,
    createdBy: scene.createdBy,
    createdAt: scene.createdAt,
    updatedAt: scene.updatedAt,
  };
}

export function toVjDemoSceneListDto(
  library: StoredVjDemoLibrary,
): VjSceneListDTO {
  return {
    items: library.scenes.map((scene) => toVjDemoSceneDto(library, scene)),
  };
}

/** One step at its array index; a null duration plays the sequence default. */
export function toVjDemoSetlistItemDto(
  item: StoredVjDemoSetlistItem,
  position: number,
): VjSetlistItemDTO {
  return {
    id: item.id,
    position,
    kind: item.kind,
    sceneId: item.sceneId,
    clipId: item.clipId,
    duration: item.duration === null ? null : { ...item.duration },
  };
}

/** Takes the library for the set list's own position. */
export function toVjDemoSetlistDto(
  library: StoredVjDemoLibrary,
  setlist: StoredVjDemoSetlist,
): VjSetlistDTO {
  return {
    id: setlist.id,
    name: setlist.name,
    position: library.setlists.indexOf(setlist),
    isLooping: setlist.isLooping,
    stepDuration: { ...setlist.stepDuration },
    items: setlist.items.map(toVjDemoSetlistItemDto),
    createdBy: setlist.createdBy,
    createdAt: setlist.createdAt,
    updatedAt: setlist.updatedAt,
  };
}

export function toVjDemoSetlistListDto(
  library: StoredVjDemoLibrary,
): VjSetlistListDTO {
  return {
    items: library.setlists.map((setlist) =>
      toVjDemoSetlistDto(library, setlist),
    ),
  };
}
