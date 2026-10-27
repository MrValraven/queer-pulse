import {
  DEMO_STUDIO_SCENES,
  type DemoStudioScene,
} from "./studioDemoScenes.data";

/** What the admin console's scene row carries into the demo store. */
export interface DemoSceneEdit {
  id: string;
  slug: string;
  name: string;
  city: string;
  blurb: string | null;
  coverUrl: string | null;
  status: DemoStudioScene["status"];
  position: number;
  createdAt: string;
}

/** A pin as the admin console lists it. */
export interface DemoScenePin {
  slug: string;
  title: string;
  startAt: string;
  venue: string | null;
  neighbourhood: string | null;
}

/**
 * The demo has no server, so the scene list the member pages read
 * (`DEMO_STUDIO_SCENES`) is the store. Admin edits write through these
 * functions, so a rename, a cover, an archive, a reorder, a pin or a removed
 * release shows on the member pages without a reload. The array is mutated in
 * place because the member reads import the same reference.
 */
export function upsertDemoScene(edit: DemoSceneEdit): void {
  const existing = DEMO_STUDIO_SCENES.find((scene) => scene.id === edit.id);
  if (existing) {
    Object.assign(existing, edit);
    return;
  }
  DEMO_STUDIO_SCENES.push({ ...edit, releaseIds: [], pinnedEvents: [] });
}

/** Positions of the active scenes, in the order the console shows them. */
export function setDemoScenePositions(
  orderedActive: { id: string; position: number }[],
): void {
  for (const { id, position } of orderedActive) {
    const scene = DEMO_STUDIO_SCENES.find((candidate) => candidate.id === id);
    if (scene) scene.position = position;
  }
}

export function setDemoScenePins(sceneId: string, pins: DemoScenePin[]): void {
  const scene = DEMO_STUDIO_SCENES.find(
    (candidate) => candidate.id === sceneId,
  );
  if (!scene) return;
  scene.pinnedEvents = pins.map((pin) => ({
    slug: pin.slug,
    title: pin.title,
    startAt: pin.startAt,
    endAt: null,
    timezone: "Europe/Lisbon",
    venue: pin.venue,
    neighbourhood: pin.neighbourhood,
    isOnline: false,
    coverImageUrl: null,
  }));
}

export function removeDemoSceneRelease(
  sceneId: string,
  releaseId: string,
): void {
  const scene = DEMO_STUDIO_SCENES.find(
    (candidate) => candidate.id === sceneId,
  );
  if (scene)
    scene.releaseIds = scene.releaseIds.filter((id) => id !== releaseId);
}
