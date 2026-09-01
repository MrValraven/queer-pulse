import { nestedPersonaPath, personaPath } from "../../app/routeMap";
import { personaCardPath } from "../subprofiles/personaLinks.data";
import { personaTitleName } from "../subprofiles/subprofile-kinds";
import type {
  SubprofileCardDTO,
  SubprofilePublicDTO,
} from "../subprofiles/api/subprofiles.api";

export interface TherapistCardVM {
  handle: string;
  href: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  creds: string | null;
  acceptingNew: boolean;
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
  // (has `ownerSlug`) lives nested under its owner's profile, not at the
  // global unlinked-persona address.
  const href = dto.ownerSlug
    ? nestedPersonaPath(dto.ownerSlug, dto.slug)
    : personaPath(dto.handle ?? handle);
  return {
    handle,
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
    specs: specialisms.map((item) => item.title).slice(0, 4),
    langs,
    note: dto.bio,
    format: dto.skinData?.practical?.mode ?? null,
  };
}

export function vmFromCard(dto: SubprofileCardDTO): TherapistCardVM {
  return {
    handle: dto.handle,
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
    specs: dto.tags.slice(0, 4),
    langs: [],
    note: null,
    format: null,
  };
}
