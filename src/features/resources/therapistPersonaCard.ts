import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import { personaCardPath } from "../subprofiles/personaLinks.data";
import { personaTitleName } from "../subprofiles/subprofile-kinds";
import type {
  SubprofileCardDTO,
  SubprofilePublicDTO,
} from "../subprofiles/api/subprofiles.api";

/** Capacity as the directory can tell it, from the persona's `availability`
 *  (kept in step with the therapist's own status switch). null = not said. */
export type TherapistCardCapacity = "open" | "wait" | "closed";

const CAPACITY_BY_AVAILABILITY: Record<string, TherapistCardCapacity> = {
  open_to_collabs: "open",
  booking: "wait",
  not_available: "closed",
};

function capacityOf(
  availability: string | null | undefined,
): TherapistCardCapacity | null {
  return availability ? (CAPACITY_BY_AVAILABILITY[availability] ?? null) : null;
}

export interface TherapistCardVM {
  /** Persona id; only the full public DTO carries it (demo), cards do not. */
  id: string | null;
  handle: string;
  /** Per-owner slug and the owner's profile slug (linked personas only). */
  slug: string;
  ownerSlug: string | null;
  href: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  creds: string | null;
  acceptingNew: boolean;
  availability: TherapistCardCapacity | null;
  specs: string[];
  langs: string[];
  note: string | null;
  format: string | null;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();

export function vmFromPublic(dto: SubprofilePublicDTO): TherapistCardVM {
  const handle = dto.handle ?? dto.slug;
  const specialisms = dto.items.filter(
    (item) => item.section === "specialisms",
  );
  const langs = (dto.skinData?.practical?.languages ?? "")
    .split(/[,/]/)
    .map((lang) => lang.trim())
    .filter(Boolean);
  // Mirrors `personaPublicPath` (personaLinks.data.ts): a linked persona
  // (has `ownerSlug`) lives nested under its owner's profile; an unlinked
  // one lives at its global handle address.
  const href = dto.ownerSlug
    ? nestedPersonaPath(dto.ownerSlug, dto.slug)
    : personaPath(dto.handle ?? handle);
  return {
    id: dto.id,
    handle,
    slug: dto.slug,
    ownerSlug: dto.ownerSlug ?? null,
    href,
    name: personaTitleName({
      displayName: dto.displayName,
      kind: dto.kind,
      ownerName: dto.ownerName,
    }),
    initials: initialsOf(dto.displayName),
    avatarUrl: dto.avatarUrl,
    creds: dto.tagline,
    acceptingNew: dto.availability === "open_to_collabs",
    availability: capacityOf(dto.availability),
    specs: specialisms.map((item) => item.title).slice(0, 4),
    langs,
    note: dto.bio,
    format: dto.skinData?.practical?.mode ?? null,
  };
}

export function vmFromCard(dto: SubprofileCardDTO): TherapistCardVM {
  return {
    id: null,
    handle: dto.handle,
    slug: dto.slug,
    ownerSlug: dto.ownerSlug,
    href: personaCardPath(dto),
    name: personaTitleName({
      displayName: dto.displayName,
      kind: dto.kind,
      ownerName: dto.ownerName,
    }),
    initials: initialsOf(dto.displayName),
    avatarUrl: dto.avatarUrl,
    creds: dto.tagline,
    acceptingNew: dto.availability === "open_to_collabs",
    availability: capacityOf(dto.availability),
    specs: dto.tags.slice(0, 4),
    langs: [],
    note: null,
    format: null,
  };
}
