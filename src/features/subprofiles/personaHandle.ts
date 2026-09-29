import { normalizeHandle } from "../../shared/handles";
import type { SubprofileKind } from "./api/subprofiles.api";
import {
  KIND_LABELS_BY_LANGUAGE,
  defaultSlugForKind,
  slugify,
} from "./subprofile-kinds";

/**
 * A linked persona's default `/p/<handle>`: the CREATOR's profile slug joined
 * to the persona's per-owner slug. Mirrors the backend's pure helpers in
 * `queerpulse-backend/src/subprofiles/persona-handle.ts`; change both
 * together.
 */
export const HANDLE_MAX_LENGTH = 30;
const MIN_PERSONA_PART_LENGTH = 3;

function trimHyphens(value: string): string {
  return value.replace(/^-+|-+$/g, "");
}

/**
 * `<creatorSlug>-<personaSlug>` (plus `-<suffix>` from 2 up) cut to fit the
 * 30-char handle limit. The persona part shrinks first; it keeps at least 3
 * chars, and the creator part gives way below that.
 */
export function linkedPersonaHandleCandidate(
  creatorSlug: string,
  personaSlug: string,
  suffix = 1,
): string {
  const tail = suffix > 1 ? `-${suffix}` : "";
  const budget = HANDLE_MAX_LENGTH - tail.length;
  const creator = trimHyphens(normalizeHandle(creatorSlug));
  const persona = trimHyphens(normalizeHandle(personaSlug));
  const personaRoom = Math.max(
    MIN_PERSONA_PART_LENGTH,
    budget - creator.length - 1,
  );
  const personaPart = trimHyphens(persona.slice(0, personaRoom));
  const creatorPart = trimHyphens(
    creator.slice(0, budget - personaPart.length - 1),
  );
  return `${creatorPart}-${personaPart}${tail}`;
}

/**
 * True when `handle` carries the creator's profile slug as a whole
 * hyphen-delimited run, as written or with its hyphens squashed. An unlinked
 * persona may not use such a handle: it would say who runs it.
 */
export function handleNamesOwner(handle: string, creatorSlug: string): boolean {
  const paddedHandle = `-${normalizeHandle(handle)}-`;
  const creator = trimHyphens(normalizeHandle(creatorSlug));
  if (!creator) return false;
  const squashedCreator = creator.replace(/-/g, "");
  return (
    paddedHandle.includes(`-${creator}-`) ||
    (squashedCreator.length >= MIN_PERSONA_PART_LENGTH &&
      paddedHandle.includes(`-${squashedCreator}-`))
  );
}

/** A label as a handle-shaped slug, accents folded first ("Cerâmica" ->
 *  "ceramica") so a translated kind name is caught whichever way it is typed. */
function kindNameSlug(label: string): string {
  return slugify(label.normalize("NFD").replace(/\p{Mark}/gu, ""));
}

/**
 * True when `handle` is only the persona's own kind: its fixed slug
 * ("therapist", "visual-artist") or its label in any UI language ("terapia").
 * A persona's `/p/` address has to name the persona, so the bare profession is
 * refused for it. Mirrors `handleIsKindName` in the backend's
 * `persona-handle.ts`; change both together.
 */
export function handleIsKindName(
  handle: string,
  kind: SubprofileKind,
): boolean {
  const normalizedHandle = normalizeHandle(handle);
  if (!normalizedHandle) return false;
  const kindNames = [
    defaultSlugForKind(kind),
    kind.replace(/_/g, "-"),
    ...Object.values(KIND_LABELS_BY_LANGUAGE).map((labels) =>
      kindNameSlug(labels[kind]),
    ),
  ];
  return kindNames.includes(normalizedHandle);
}
