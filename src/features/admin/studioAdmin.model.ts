import { ApiError } from "../../shared/api/client";
import { foldForSearch } from "../../shared/lib/foldForSearch";
import {
  STUDIO_DISCOVERY_LIMITS,
  STUDIO_SCENE_SLUG_PATTERN,
  type StudioCurationShelf,
} from "../studio/api/studio.types";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "../studio/studioErrors.data";
import type {
  AdminStudioCurationDTO,
  AdminStudioPickDTO,
  AdminStudioSceneDTO,
} from "./api/studioDiscoveryAdmin.api";

// Labels and pure rules the Studio discovery console shares. No demo data
// lives here, so the console's chunk carries none.

export const STUDIO_ADMIN_TABS = ["shelves", "scenes"] as const;
export type StudioAdminTabId = (typeof STUDIO_ADMIN_TABS)[number];

export function isStudioAdminTab(value: string): value is StudioAdminTabId {
  return (STUDIO_ADMIN_TABS as readonly string[]).includes(value);
}

export const STUDIO_ADMIN_SHELF_LABEL_KEY: Record<StudioCurationShelf, string> =
  {
    featured: "admin:studioAdmin.shelf.featured",
    staff_picks: "admin:studioAdmin.shelf.staff_picks",
    new_this_week: "admin:studioAdmin.shelf.new_this_week",
  };

export const STUDIO_ADMIN_SHELF_ADD_KEY: Record<StudioCurationShelf, string> = {
  featured: "admin:studioAdmin.shelf.addCta.featured",
  staff_picks: "admin:studioAdmin.shelf.addCta.staff_picks",
  new_this_week: "admin:studioAdmin.shelf.addCta.new_this_week",
};

const SHELF_FIELD: Record<StudioCurationShelf, keyof AdminStudioCurationDTO> = {
  featured: "featured",
  staff_picks: "staffPicks",
  new_this_week: "newThisWeek",
};

export function shelfMaxOf(shelf: StudioCurationShelf): number {
  return shelf === "featured"
    ? STUDIO_DISCOVERY_LIMITS.curationFeaturedMax
    : STUDIO_DISCOVERY_LIMITS.curationShelfMax;
}

export function picksOnShelf(
  curation: AdminStudioCurationDTO,
  shelf: StudioCurationShelf,
): AdminStudioPickDTO[] {
  return curation[SHELF_FIELD[shelf]];
}

/** Positions 1..n in list order, as the server keeps them. */
export function renumbered<Item extends { position: number }>(
  items: Item[],
): Item[] {
  return items.map((item, index) => ({ ...item, position: index + 1 }));
}

export function withShelfPicks(
  curation: AdminStudioCurationDTO,
  shelf: StudioCurationShelf,
  picks: AdminStudioPickDTO[],
): AdminStudioCurationDTO {
  return { ...curation, [SHELF_FIELD[shelf]]: renumbered(picks) };
}

/** The id order after moving one id to a target index, or null when the move
 *  changes nothing or falls outside the list. */
export function movedIds(
  ids: readonly string[],
  movedId: string,
  targetIndex: number,
): string[] | null {
  const fromIndex = ids.indexOf(movedId);
  if (fromIndex < 0 || targetIndex < 0 || targetIndex >= ids.length)
    return null;
  if (fromIndex === targetIndex) return null;
  const next = [...ids];
  next.splice(fromIndex, 1);
  next.splice(targetIndex, 0, movedId);
  return next;
}

/** `items` in the order of `ids`; ids with no item are skipped. */
export function orderedByIds<Item extends { id: string }>(
  items: Item[],
  ids: readonly string[],
): Item[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return ids.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

/** True when `ids` names every item exactly once, the order a reorder must
 *  send; the demo answers the server's order 409 for any other list. */
export function isSameIdSet(
  ids: readonly string[],
  items: readonly { id: string }[],
): boolean {
  const idSet = new Set(ids);
  return (
    ids.length === items.length &&
    idSet.size === ids.length &&
    items.every((item) => idSet.has(item.id))
  );
}

export interface StudioAdminAge {
  value: number;
  unit: "minute" | "hour" | "day";
}

/** How long ago, in the largest whole unit, for
 *  `fmt.relativeTime(-age.value, age.unit)`. */
export function ageOf(createdAtIso: string, nowMs: number): StudioAdminAge {
  const elapsedMs = Math.max(0, nowMs - Date.parse(createdAtIso));
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 60) return { value: Math.max(1, minutes), unit: "minute" };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { value: hours, unit: "hour" };
  return { value: Math.floor(hours / 24), unit: "day" };
}

/** The base for a name that folds to fewer than 2 characters, as the
 *  backend's `studio-scene-slug.ts` sets it. */
export const SCENE_SLUG_FALLBACK_BASE = "scene";

/** The last numbered suffix tried before a create answers 409. */
export const SCENE_SLUG_LAST_SUFFIX = 50;

/** The slug the server builds from a name: accents folded, lowercased,
 *  every run of other characters one hyphen, trimmed, cut to 60, and the
 *  fallback base when under 2 characters are left. The demo uses it; live
 *  sends no slug and lets the server build it. */
export function sceneSlugFromName(name: string): string {
  const cut = foldForSearch(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, STUDIO_DISCOVERY_LIMITS.sceneSlugMaxLength)
    .replace(/-+$/g, "");
  return cut.length >= STUDIO_DISCOVERY_LIMITS.sceneSlugMinLength
    ? cut
    : SCENE_SLUG_FALLBACK_BASE;
}

/** The base, then `-2` up to `-50`, each shortened to fit in 60, in the
 *  order the server tries them. */
export function sceneSlugCandidates(base: string): string[] {
  const candidates = [base];
  for (
    let suffixNumber = 2;
    suffixNumber <= SCENE_SLUG_LAST_SUFFIX;
    suffixNumber += 1
  ) {
    const suffix = `-${suffixNumber}`;
    const stem = base
      .slice(0, STUDIO_DISCOVERY_LIMITS.sceneSlugMaxLength - suffix.length)
      .replace(/-+$/, "");
    candidates.push(`${stem}${suffix}`);
  }
  return candidates;
}

export function isValidSceneSlug(slug: string): boolean {
  return (
    slug.length >= STUDIO_DISCOVERY_LIMITS.sceneSlugMinLength &&
    slug.length <= STUDIO_DISCOVERY_LIMITS.sceneSlugMaxLength &&
    STUDIO_SCENE_SLUG_PATTERN.test(slug)
  );
}

/** Active scenes by position, then archived scenes by name, as the admin
 *  list endpoint answers. */
export function sortedAdminScenes(
  scenes: AdminStudioSceneDTO[],
): AdminStudioSceneDTO[] {
  const active = scenes
    .filter((scene) => scene.status === "active")
    .sort((left, right) => left.position - right.position);
  const archived = scenes
    .filter((scene) => scene.status === "archived")
    .sort((left, right) => left.name.localeCompare(right.name));
  return [...active, ...archived];
}

/** The catalog key a refused console write shows: the Studio code's own
 *  line when the server sent one, else the console's save line. Every
 *  dialog and toast in the console reads it. */
export function studioAdminSaveErrorKeyOf(cause: unknown): string {
  const key = studioErrorMessageKeyOf(cause);
  return key === studioErrorMessageKey(null)
    ? "admin:studioAdmin.saveError"
    : key;
}

/** A console read refused with 403. Moderators and admins both open the
 *  console, so the page says so with `admin:studioAdmin.forbidden`, which
 *  names no role. */
export function isStudioAdminForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}
