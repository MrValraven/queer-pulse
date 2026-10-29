import type {
  StudioArtistRefDTO,
  StudioPageDTO,
  StudioPriceDTO,
} from "./studio.types";
import type { StudioPurchaseItemDTO } from "./studioPurchases.types";
import { demoStudioRelease, demoStudioTrack } from "./studioDemoApi";
import { DEMO_STUDIO_ME } from "./studioDemoMe.data";
import { studioRefusal } from "./studioDemoMutations";
import { demoWithheldTrackIds } from "./studioDemoSafety";
import {
  DEMO_PAYMENT_METHODS,
  DEMO_RELEASE_PRICES,
  DEMO_TRACK_AUDIO_TYPES,
  DEMO_TRACK_PRICES,
  demoPurchaseRows,
  type DemoPurchaseRow,
} from "./studioDemoPurchases.data";
import type { StudioPaymentMethodDTO } from "./studioPurchases.types";

const DAY_MILLISECONDS = 86_400_000;

interface DemoPurchaseStore {
  prices: Map<string, StudioPriceDTO>;
  /** The persona behind a price set at runtime (items made in the demo
   *  editor are not in the catalogue). */
  priceArtists: Map<string, string>;
  methods: Map<string, StudioPaymentMethodDTO[]>;
  methodsUpdatedAt: Map<string, string>;
  rows: DemoPurchaseRow[];
  /** Payment codes the demo issued, with their tokens. */
  issuedReferences: Map<string, string>;
  /** How many codes route 18 handed out since the last reset. */
  referencesIssued: number;
}

/** The first code the demo issues after a reset. It stays reusable, so a
 *  cancel followed by a new claim (and the tests) can pay with it again. */
export const DEMO_REFERENCE_CODE = "QP4M7R";
export const DEMO_REFERENCE_TOKEN = "demo-reference-token";
let store: DemoPurchaseStore | null = null;

function buildStore(): DemoPurchaseStore {
  const nowMilliseconds = Date.now();
  const priced = (kind: string, prices: Record<string, StudioPriceDTO>) =>
    Object.entries(prices).map(
      ([id, price]) => [`${kind}:${id}`, price] as const,
    );
  const methodEntries = Object.entries(DEMO_PAYMENT_METHODS);
  return {
    prices: new Map([
      ...priced("release", DEMO_RELEASE_PRICES),
      ...priced("track", DEMO_TRACK_PRICES),
    ]),
    priceArtists: new Map(),
    methods: new Map(
      methodEntries.map(([personaId, seeds]) => [
        personaId,
        seeds.map((seed, position) => ({
          ...seed,
          id: `${personaId}-method-${position}`,
          position,
        })),
      ]),
    ),
    methodsUpdatedAt: new Map(
      methodEntries.map(([personaId]) => [
        personaId,
        new Date(nowMilliseconds - 30 * DAY_MILLISECONDS).toISOString(),
      ]),
    ),
    rows: demoPurchaseRows(nowMilliseconds),
    issuedReferences: new Map([[DEMO_REFERENCE_CODE, DEMO_REFERENCE_TOKEN]]),
    referencesIssued: 0,
  };
}

export function demoPurchaseStore(): DemoPurchaseStore {
  store ??= buildStore();
  return store;
}

export function resetDemoPurchases(): void {
  store = null;
}

export const demoReleasePriceOf = (releaseId: string): StudioPriceDTO | null =>
  demoPurchaseStore().prices.get(`release:${releaseId}`) ?? null;
export const demoTrackPriceOf = (trackId: string): StudioPriceDTO | null =>
  demoPurchaseStore().prices.get(`track:${trackId}`) ?? null;

export function pageOf<Item>(
  items: Item[],
  cursor: string | null,
  size: number,
): StudioPageDTO<Item> {
  const offset = cursor ? Number(cursor) : 0;
  const hasMore = offset + size < items.length;
  return {
    items: items.slice(offset, offset + size),
    pageInfo: { nextCursor: hasMore ? String(offset + size) : null, hasMore },
  };
}

/** The persona must be one the viewer runs, as the server's member check. */
export function ownedPersonaOf(subprofileId: string): StudioArtistRefDTO {
  const persona = DEMO_STUDIO_ME.uploadablePersonas.find(
    (candidate) => candidate.id === subprofileId,
  );
  if (persona === undefined)
    throw studioRefusal(404, "studio_persona_not_found");
  return persona;
}

export interface DemoCatalogueItem {
  item: StudioPurchaseItemDTO;
  artist: StudioArtistRefDTO;
  price: StudioPriceDTO | null;
  status: string;
  isTrackUnavailable: boolean;
  tracks: {
    id: string;
    position: number;
    title: string;
    durationSeconds: number | null;
    hasAudio: boolean;
    /** The stored content type; null without audio. */
    audioContentType: string | null;
    isWithheld: boolean;
  }[];
}

type CatalogueTrack = DemoCatalogueItem["tracks"][number];
const catalogueTrackOf = (track: {
  id: string;
  position: number;
  title: string;
  durationSeconds: number | null;
  hasAudio: boolean;
  isWithheld?: boolean;
}): CatalogueTrack => ({
  id: track.id,
  position: track.position,
  title: track.title,
  durationSeconds: track.durationSeconds,
  hasAudio: track.hasAudio,
  audioContentType: track.hasAudio
    ? (DEMO_TRACK_AUDIO_TYPES[track.id] ?? "audio/mpeg")
    : null,
  isWithheld: track.isWithheld === true || demoWithheldTrackIds().has(track.id),
});

/** The release or track as the demo catalogue reads it, null when unknown. */
export function catalogueItemOf(
  kind: "release" | "track",
  itemId: string,
): DemoCatalogueItem | null {
  try {
    if (kind === "track") {
      const track = demoStudioTrack(itemId);
      return {
        item: {
          kind,
          title: track.title,
          releaseId: track.releaseId,
          trackId: track.id,
          releaseType: track.release.type,
          coverUrl: track.release.coverUrl,
          isAvailable: true,
        },
        artist: track.release.artist,
        price: demoTrackPriceOf(track.id),
        status: track.release.status ?? "published",
        isTrackUnavailable: !track.hasAudio || track.isWithheld === true,
        tracks: [catalogueTrackOf(track)],
      };
    }
    const release = demoStudioRelease(itemId);
    return {
      item: {
        kind,
        title: release.title,
        releaseId: release.id,
        trackId: null,
        releaseType: release.type,
        coverUrl: release.coverUrl,
        isAvailable: true,
      },
      artist: release.artist,
      price: demoReleasePriceOf(release.id),
      status: release.status,
      isTrackUnavailable: false,
      tracks: release.tracks.map(catalogueTrackOf),
    };
  } catch {
    return null;
  }
}

export function hasItemsForSale(personaId: string): boolean {
  return [...demoPurchaseStore().prices.keys()].some((key) => {
    if (demoPurchaseStore().priceArtists.get(key) === personaId) return true;
    const [kind = "", id = ""] = key.split(":");
    return (
      (kind === "release" || kind === "track") &&
      catalogueItemOf(kind, id)?.artist.id === personaId
    );
  });
}
