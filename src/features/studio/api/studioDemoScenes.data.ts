import { ALBUM_COVER } from "../studioAlbum.data";
import { TRACKS as HOME_CARDS } from "../studioPage.data";
import type {
  StudioSceneCardDTO,
  StudioSceneEventDTO,
  StudioSceneRefDTO,
  StudioSceneStatus,
} from "./studio.types";
import { DEMO_DEFAULT_RELEASE_ID } from "./studioDemoMe.data";

/** A demo scene with what the member reads and the admin console both need.
 *  Names and blurbs are staff content, written in one language. */
export interface DemoStudioScene extends StudioSceneCardDTO {
  blurb: string | null;
  status: StudioSceneStatus;
  position: number;
  /** Releases linked to the scene, by id. */
  releaseIds: string[];
  /** Events staff pinned. The demo has no persona affiliations, so these are
   *  the scene page's upcoming events. Slugs match demo gatherings. Each
   *  one is open to browse and hosted outside any space: the server keeps
   *  space-hosted events off every scene, so a demo pin stays clear of them. */
  pinnedEvents: StudioSceneEventDTO[];
  createdAt: string;
}

const SUPPER_CLUB: StudioSceneEventDTO = {
  slug: "supper-club-12",
  title: "Queer Supper Club №12",
  startAt: "2026-11-14T19:30:00.000Z",
  endAt: "2026-11-14T23:00:00.000Z",
  timezone: "Europe/Lisbon",
  venue: null,
  neighbourhood: "Mouraria",
  isOnline: false,
  coverImageUrl: null,
};

const HISTORY_WALK: StudioSceneEventDTO = {
  slug: "queer-history-walk",
  title: "Queer history walk: Mouraria",
  startAt: "2026-11-21T10:00:00.000Z",
  endAt: "2026-11-21T12:30:00.000Z",
  timezone: "Europe/Lisbon",
  venue: null,
  neighbourhood: "Mouraria",
  isOnline: false,
  coverImageUrl: null,
};

export const DEMO_STUDIO_SCENES: DemoStudioScene[] = [
  {
    id: "demo-scene-mouraria-fado",
    slug: "mouraria-fado",
    name: "Mouraria fado",
    city: "Lisboa",
    coverUrl: ALBUM_COVER,
    blurb:
      "Fado sung close and late, in the tascas and kitchens around Mouraria",
    status: "active",
    position: 1,
    releaseIds: [
      DEMO_DEFAULT_RELEASE_ID,
      "demo-release-mariana-2",
      "demo-release-mariana-3",
    ],
    pinnedEvents: [SUPPER_CLUB, HISTORY_WALK],
    createdAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "demo-scene-porto-warehouse",
    slug: "porto-warehouse",
    name: "Warehouse nights",
    city: "Porto",
    coverUrl: HOME_CARDS[1]?.image ?? null,
    blurb: "Synths and long sets from the warehouses by the Douro",
    status: "active",
    position: 2,
    releaseIds: ["demo-release-home-2", "demo-release-home-4"],
    pinnedEvents: [],
    createdAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: "demo-scene-sintra-choirs",
    slug: "sintra-choirs",
    name: "Sintra choirs",
    city: "Sintra",
    coverUrl: null,
    blurb: null,
    status: "archived",
    position: 3,
    releaseIds: ["demo-release-home-3"],
    pinnedEvents: [],
    createdAt: "2026-08-20T10:00:00.000Z",
  },
];

const sceneOfRelease = (releaseId: string) =>
  DEMO_STUDIO_SCENES.find((scene) => scene.releaseIds.includes(releaseId));

const refOf = (scene: DemoStudioScene | undefined): StudioSceneRefDTO | null =>
  scene && scene.status === "active"
    ? { slug: scene.slug, name: scene.name }
    : null;

/** The card's scene: null when the release has none or the scene is
 *  archived, as the server answers. */
export function demoSceneRefOfRelease(
  releaseId: string,
): StudioSceneRefDTO | null {
  return refOf(sceneOfRelease(releaseId));
}

/** The owner's scene id, kept while the scene is archived. */
export function demoSceneIdOfRelease(releaseId: string): string | null {
  return sceneOfRelease(releaseId)?.id ?? null;
}

/** The ref a demo edit shows after picking a scene by id. */
export function demoSceneRefById(sceneId: string): StudioSceneRefDTO | null {
  return refOf(DEMO_STUDIO_SCENES.find((scene) => scene.id === sceneId));
}
