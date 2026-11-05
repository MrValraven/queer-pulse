import { ApiError } from "../../shared/api/client";
import { pickDirectoryCardImage } from "./api/directoryCard.adapters";
import {
  isPersonaWallFillOrder,
  PERSONA_WALL_MAX_PICKS,
  PERSONA_WALL_SEARCH_LIMIT,
  type PersonaWallAdminDTO,
  type PersonaWallFillOrder,
  type PersonaWallPersonaDTO,
  type PersonaWallPickDTO,
  type PersonaWallPreviewCardDTO,
  type PersonaWallPublicState,
  type PersonaWallReasonCode,
  type PersonaWallSearchResultDTO,
} from "./api/personaWall.api";
import type { SubprofileCardDTO } from "./api/subprofiles.api";
import {
  DEMO_PERSONA_WALL_SEED,
  type DemoPersonaWallSeed,
} from "./data/personaWallDemoSeed.data";
import {
  DEMO_SUBPROFILES,
  mockDirectory,
  toCardDto,
  type DemoSubprofile,
} from "./data/subprofiles.data";

// The demo persona wall: one in-memory record of the admin's picks and fill
// order, read by the public wall (`useSubprofileWall`) and the admin page
// alike, so a demo pick shows on `/subprofiles` the moment it is made. It
// mirrors the server's ordering and refusals (contract sections 3 to 5).

interface DemoPersonaWallState {
  pickPersonaIds: string[];
  fillOrder: PersonaWallFillOrder;
}

let wallState: DemoPersonaWallState | null = null;

const copyOfSeed = (seed: DemoPersonaWallSeed): DemoPersonaWallState => ({
  pickPersonaIds: [...seed.pickPersonaIds],
  fillOrder: seed.fillOrder,
});

const current = (): DemoPersonaWallState =>
  (wallState ??= copyOfSeed(DEMO_PERSONA_WALL_SEED));

/** Put the demo wall back to a seed (the authored one when none is given). */
export function resetDemoPersonaWall(seed?: DemoPersonaWallSeed): void {
  wallState = copyOfSeed(seed ?? DEMO_PERSONA_WALL_SEED);
}

const STATUS_TEXT = {
  400: "Bad Request",
  404: "Not Found",
  409: "Conflict",
} as const;

/** The refusal the server answers with, as the API client would raise it:
 *  `{ statusCode, message, code }` plus `publicState` on a not-listed add. */
export function personaWallRefusal(
  code: PersonaWallReasonCode,
  status: 400 | 404 | 409,
  extra?: { publicState?: PersonaWallPublicState },
): ApiError {
  return new ApiError(status, STATUS_TEXT[status], {
    statusCode: status,
    message: STATUS_TEXT[status],
    code,
    ...extra,
  });
}

/** Whether a demo persona shows on the public wall, with the contract's
 *  precedence. Demo has no takedown apart from `removedAt`, so it never
 *  answers `taken_down`. */
export function demoPersonaPublicState(
  persona: DemoSubprofile,
): PersonaWallPublicState {
  if (persona.removedAt) return "removed";
  if (persona.status === "draft") return "draft";
  if (persona.visibility !== "open") return "not_open";
  return "shown";
}

/** `YYYY-MM-DD` of the local calendar day. */
function localDateKey(today: Date): string {
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

/** The daily shuffle's rank: a 32-bit FNV-1a hash of the persona id and the
 *  day, so the order holds for a day and changes the next. */
export function dailyShuffleRank(personaId: string, today: Date): number {
  const input = personaId + localDateKey(today);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

const findPersona = (personaId: string): DemoSubprofile | undefined =>
  DEMO_SUBPROFILES.find((persona) => persona.id === personaId);

const pickIdOf = (personaId: string) => `demo-wall-pick-${personaId}`;

/** The persona-only projection: avatar, else cover, else no image. */
function toPersonaWallPersona(persona: DemoSubprofile): PersonaWallPersonaDTO {
  const projection = {
    id: persona.id,
    handle: persona.handle,
    displayName: persona.displayName,
    kind: persona.kind,
    accent: persona.accent ?? null,
  };
  if (persona.avatarUrl) {
    return {
      ...projection,
      imageUrl: persona.avatarUrl,
      imageCrop: persona.avatarCrop ?? null,
      imageSource: "avatar",
    };
  }
  if (persona.coverUrl) {
    return {
      ...projection,
      imageUrl: persona.coverUrl,
      imageCrop: persona.coverCrop ?? null,
      imageSource: "cover",
    };
  }
  return { ...projection, imageUrl: null, imageCrop: null, imageSource: null };
}

/** The fill order's own comparison, before the name and id tie-breaks. */
function compareByFillOrder(
  fillOrder: PersonaWallFillOrder,
  today: Date,
): (first: DemoSubprofile, second: DemoSubprofile) => number {
  switch (fillOrder) {
    case "endorsed":
      return (first, second) =>
        second.endorsementCount - first.endorsementCount;
    case "followed":
      return (first, second) => second.followerCount - first.followerCount;
    case "newest":
      // Demo personas carry no `createdAt`; the registry is authored newest
      // first, so its index stands for the age.
      return (first, second) =>
        DEMO_SUBPROFILES.indexOf(first) - DEMO_SUBPROFILES.indexOf(second);
    case "daily_shuffle":
      return (first, second) =>
        dailyShuffleRank(first.id, today) - dailyShuffleRank(second.id, today);
  }
}

/** The wall in order: shown picks, then the fill, up to nine cards. */
function demoWallCards(today: Date): PersonaWallPreviewCardDTO[] {
  const { pickPersonaIds, fillOrder } = current();
  const pickedCards = pickPersonaIds
    .map(findPersona)
    .filter(
      (persona): persona is DemoSubprofile =>
        persona !== undefined && demoPersonaPublicState(persona) === "shown",
    )
    .map((persona) => ({
      ...toCardDto(persona),
      wallSource: "picked" as const,
    }));
  const pickedIds = new Set(pickPersonaIds);
  const hasPhoto = (persona: DemoSubprofile) =>
    pickDirectoryCardImage(toCardDto(persona)) !== null;
  const compareFill = compareByFillOrder(fillOrder, today);
  const filledCards = DEMO_SUBPROFILES.filter(
    (persona) =>
      !pickedIds.has(persona.id) && demoPersonaPublicState(persona) === "shown",
  )
    .sort(
      (first, second) =>
        Number(hasPhoto(second)) - Number(hasPhoto(first)) ||
        compareFill(first, second) ||
        first.displayName.localeCompare(second.displayName) ||
        first.id.localeCompare(second.id),
    )
    .map((persona) => ({
      ...toCardDto(persona),
      wallSource: "filled" as const,
    }));
  return [...pickedCards, ...filledCards].slice(0, PERSONA_WALL_MAX_PICKS);
}

/** `GET /subprofiles/wall` in demo: the wall's directory cards. */
export function demoPublicPersonaWall(
  today: Date = new Date(),
): SubprofileCardDTO[] {
  return demoWallCards(today).map(
    ({ wallSource: _wallSource, ...card }) => card,
  );
}

/** `GET /admin/personas/wall` in demo. */
export function demoAdminPersonaWall(
  today: Date = new Date(),
): PersonaWallAdminDTO {
  const { pickPersonaIds, fillOrder } = current();
  const picks = pickPersonaIds.flatMap((personaId): PersonaWallPickDTO[] => {
    const persona = findPersona(personaId);
    if (!persona) return [];
    return [
      {
        id: pickIdOf(personaId),
        position: 0,
        persona: toPersonaWallPersona(persona),
        publicState: demoPersonaPublicState(persona),
      },
    ];
  });
  return {
    fillOrder,
    picks: picks.map((pick, index) => ({ ...pick, position: index + 1 })),
    preview: demoWallCards(today),
  };
}

/** `GET /admin/personas/wall/search` in demo: listed personas matching the
 *  directory's search haystack, with the picked ones flagged. */
export function demoSearchPersonaWall(
  query: string,
): PersonaWallSearchResultDTO[] {
  const term = query.trim();
  if (!term) return [];
  const pickedIds = new Set(current().pickPersonaIds);
  return mockDirectory({ query: term })
    .map((card) => findPersona(card.id ?? ""))
    .filter((persona): persona is DemoSubprofile => persona !== undefined)
    .slice(0, PERSONA_WALL_SEARCH_LIMIT)
    .map((persona) => ({
      persona: toPersonaWallPersona(persona),
      isPicked: pickedIds.has(persona.id),
    }));
}

/** `POST /admin/personas/wall/picks` in demo: appends the persona. */
export function demoAddPersonaWallPick(
  subprofileId: string,
): PersonaWallAdminDTO {
  const state = current();
  const persona = findPersona(subprofileId);
  if (!persona) throw personaWallRefusal("PERSONA_WALL_PERSONA_NOT_FOUND", 404);
  if (state.pickPersonaIds.includes(subprofileId)) {
    throw personaWallRefusal("PERSONA_WALL_ALREADY_PICKED", 409);
  }
  const publicState = demoPersonaPublicState(persona);
  if (publicState !== "shown") {
    throw personaWallRefusal("PERSONA_WALL_NOT_LISTED", 409, { publicState });
  }
  if (state.pickPersonaIds.length >= PERSONA_WALL_MAX_PICKS) {
    throw personaWallRefusal("PERSONA_WALL_FULL", 409);
  }
  state.pickPersonaIds = [...state.pickPersonaIds, subprofileId];
  return demoAdminPersonaWall();
}

/** `PATCH /admin/personas/wall/picks/reorder` in demo. The ids must be the
 *  current pick ids, each once. */
export function demoReorderPersonaWallPicks(
  ids: readonly string[],
): PersonaWallAdminDTO {
  const state = current();
  const personaIdByPickId = new Map(
    state.pickPersonaIds.map((personaId) => [pickIdOf(personaId), personaId]),
  );
  const isExactPickSet =
    ids.length === personaIdByPickId.size &&
    new Set(ids).size === ids.length &&
    ids.every((pickId) => personaIdByPickId.has(pickId));
  if (!isExactPickSet) {
    throw personaWallRefusal("PERSONA_WALL_REORDER_MISMATCH", 409);
  }
  state.pickPersonaIds = ids.flatMap((pickId) => {
    const personaId = personaIdByPickId.get(pickId);
    return personaId === undefined ? [] : [personaId];
  });
  return demoAdminPersonaWall();
}

/** `DELETE /admin/personas/wall/picks/:id` in demo; positions close up. */
export function demoRemovePersonaWallPick(pickId: string): PersonaWallAdminDTO {
  const state = current();
  const removedIndex = state.pickPersonaIds.map(pickIdOf).indexOf(pickId);
  if (removedIndex === -1) {
    throw personaWallRefusal("PERSONA_WALL_PICK_NOT_FOUND", 404);
  }
  state.pickPersonaIds = state.pickPersonaIds.filter(
    (_personaId, index) => index !== removedIndex,
  );
  return demoAdminPersonaWall();
}

/** `PATCH /admin/personas/wall/settings` in demo. */
export function demoSetPersonaWallFillOrder(
  fillOrder: string,
): PersonaWallAdminDTO {
  if (!isPersonaWallFillOrder(fillOrder)) {
    throw personaWallRefusal("PERSONA_WALL_INVALID_FILL_ORDER", 400);
  }
  current().fillOrder = fillOrder;
  return demoAdminPersonaWall();
}
