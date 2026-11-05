import { apiGet, ApiError } from "../../../shared/api/client";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import type { SubprofileCardDTO } from "./subprofiles.api";

// The persona wall contract (QUEERPULSE-PERSONA-WALL-CONTRACT-2026-11-05,
// sections 2 to 6), mirrored from the backend's `persona-wall.constants.ts`.
// The public wall on `/subprofiles` and the admin curation page both read
// these types; the demo store in `../personaWallDemoStore.ts` answers with
// the same shapes.

/** The most personas an admin can pin to the wall, and the wall's size. */
export const PERSONA_WALL_MAX_PICKS = 9;
/** The most results one admin search answers with. */
export const PERSONA_WALL_SEARCH_LIMIT = 20;
/** The longest search term the server reads (contract: `q` trimmed, 1..100). */
export const PERSONA_WALL_SEARCH_MAX_LENGTH = 100;

/** How the wall fills the tiles the picks leave empty. */
export const PERSONA_WALL_FILL_ORDERS = [
  "endorsed",
  "followed",
  "newest",
  "daily_shuffle",
] as const;
export type PersonaWallFillOrder = (typeof PERSONA_WALL_FILL_ORDERS)[number];
export const DEFAULT_PERSONA_WALL_FILL_ORDER: PersonaWallFillOrder = "endorsed";

/** Whether a persona shows on the public wall, and the reason when it does
 *  not. Precedence when several apply: `removed`, `taken_down`, `draft`,
 *  `not_open`, else `shown`. */
export type PersonaWallPublicState =
  "shown" | "draft" | "not_open" | "removed" | "taken_down";

/** The persona-only projection the admin page reads. It carries no owner
 *  field. */
export interface PersonaWallPersonaDTO {
  id: string;
  handle: string | null;
  displayName: string;
  kind: string;
  /** Avatar, else cover, else null. */
  imageUrl: string | null;
  /** The crop object that goes with `imageUrl`. */
  imageCrop: unknown | null;
  imageSource: "avatar" | "cover" | null;
  /** The persona's own palette key. A persona column, so it says nothing
   *  about the owner. */
  accent: string | null;
}

export interface PersonaWallPickDTO {
  /** The pick id. */
  id: string;
  /** 1-based. */
  position: number;
  persona: PersonaWallPersonaDTO;
  publicState: PersonaWallPublicState;
}

/** One wall card in the admin preview, marked by where it came from. */
export type PersonaWallPreviewCardDTO = SubprofileCardDTO & {
  wallSource: "picked" | "filled";
};

export interface PersonaWallAdminDTO {
  fillOrder: PersonaWallFillOrder;
  /** In position order. */
  picks: PersonaWallPickDTO[];
  /** 0..9 cards, with no viewer block filter. */
  preview: PersonaWallPreviewCardDTO[];
}

export interface PersonaWallSearchResultDTO {
  persona: PersonaWallPersonaDTO;
  isPicked: boolean;
}

/** `GET /subprofiles/wall`: 0..9 directory cards in wall order. */
export interface SubprofileWallResponseDTO {
  items: SubprofileCardDTO[];
}

/** Every reason code a wall refusal carries (contract section 3). */
export const PERSONA_WALL_REASON_CODES = [
  "PERSONA_WALL_FULL",
  "PERSONA_WALL_ALREADY_PICKED",
  "PERSONA_WALL_PERSONA_NOT_FOUND",
  "PERSONA_WALL_NOT_LISTED",
  "PERSONA_WALL_PICK_NOT_FOUND",
  "PERSONA_WALL_REORDER_MISMATCH",
  "PERSONA_WALL_INVALID_FILL_ORDER",
] as const;
export type PersonaWallReasonCode = (typeof PERSONA_WALL_REASON_CODES)[number];

/** The states a `PERSONA_WALL_NOT_LISTED` body can name. */
const HIDDEN_PERSONA_WALL_STATES: readonly Exclude<
  PersonaWallPublicState,
  "shown"
>[] = ["draft", "not_open", "removed", "taken_down"];

/** The parsed refusal body, when the failure is an `ApiError` that has one. */
function refusalBodyOf(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  return typeof body === "object" && body !== null
    ? (body as Record<string, unknown>)
    : null;
}

/** The wall reason code off a refused call, or null when the body names
 *  none of the contract's codes. */
export function personaWallReasonOf(
  error: unknown,
): PersonaWallReasonCode | null {
  const code = refusalBodyOf(error)?.code;
  return typeof code === "string" &&
    (PERSONA_WALL_REASON_CODES as readonly string[]).includes(code)
    ? (code as PersonaWallReasonCode)
    : null;
}

/** The hidden state a `PERSONA_WALL_NOT_LISTED` refusal names, or null when
 *  the body is another refusal or comes from a server that sends no
 *  `publicState`. */
export function personaWallRefusedStateOf(
  error: unknown,
): Exclude<PersonaWallPublicState, "shown"> | null {
  if (personaWallReasonOf(error) !== "PERSONA_WALL_NOT_LISTED") return null;
  const publicState = refusalBodyOf(error)?.publicState;
  return (
    HIDDEN_PERSONA_WALL_STATES.find((state) => state === publicState) ?? null
  );
}

export function isPersonaWallFillOrder(
  value: unknown,
): value is PersonaWallFillOrder {
  return (
    typeof value === "string" &&
    (PERSONA_WALL_FILL_ORDERS as readonly string[]).includes(value)
  );
}

/** The `imageCrop` of a wall persona as a crop rect, when it has numeric
 *  `x`, `y`, `width`, `height` and a string `aspect`; else undefined. */
export function personaWallCropOf(value: unknown): CropRect | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const candidate = value as Record<string, unknown>;
  const hasNumericBox = [
    candidate.x,
    candidate.y,
    candidate.width,
    candidate.height,
  ].every((side) => typeof side === "number" && Number.isFinite(side));
  if (!hasNumericBox || typeof candidate.aspect !== "string") return undefined;
  return {
    x: candidate.x as number,
    y: candidate.y as number,
    width: candidate.width as number,
    height: candidate.height as number,
    aspect: candidate.aspect,
  };
}

/** The public wall's cards, members only. */
export const getSubprofileWall = (
  signal?: AbortSignal,
): Promise<SubprofileWallResponseDTO> =>
  apiGet<SubprofileWallResponseDTO>(
    "/subprofiles/wall",
    undefined,
    undefined,
    signal,
  );
