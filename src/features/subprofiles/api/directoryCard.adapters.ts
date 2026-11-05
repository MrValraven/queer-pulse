import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { initialsFromName } from "../../../shared/lib/initials";
import type {
  AccentKey,
  AvailabilityKey,
  CreditFaceDTO,
  SubprofileCardDTO,
  SubprofileKind,
} from "./subprofiles.api";
import {
  ACCENT_OPTIONS,
  AVAILABILITY_PILL_TONE,
  DEFAULT_ACCENT,
  THERAPIST_AVAILABILITY_LABEL_KEYS,
} from "../subprofilePresence.data";
import { KIND_LABEL_KEYS, personaTitleName } from "../subprofile-kinds";
import { skinFor } from "../subprofile-skins";
import { personaCardPath } from "../personaLinks.data";
import { tattooStatusLabelKey } from "../skins/tattoo/tattooBooksStatus";
import { AVAILABILITY_TO_TATTOO_STATUS } from "../skins/tattoo/tattooVocab.data";

// ── View models ──────────────────────────────────────────────────────────────

/** The picture a directory card or wall tile shows: the avatar framed by its
 *  saved crop, else the banner framed by its crop as a focal point. */
export interface DirectoryCardImage {
  src: string;
  crop: CropRect | undefined;
  source: "avatar" | "cover";
}

/** The availability pill on a portrait, in the persona's own words. */
export interface DirectoryAvailabilityPill {
  labelKey: string;
  tone: "jade" | "coral" | "muted";
}

/** One face on a portrait's credits row. */
export interface CreditFaceView {
  /** Stable React key within one card's row. */
  key: string;
  kind: "persona" | "member";
  name: string;
  initials: string;
  avatarUrl: string | null;
  accent: AccentKey;
}

/** The portrait card's credits row: `count` distinct counterparts, at most
 *  three faces. A card with `count` 0 draws no row. */
export interface PortraitCreditsView {
  count: number;
  faces: CreditFaceView[];
}

/** Everything the directory's portrait card draws. */
export interface PortraitCardView {
  /** Stable React key: the persona id, else its handle or slug. */
  key: string;
  /** The follow routes' key; null on a payload too old to carry one. */
  id: string | null;
  href: string;
  /** "Owner Name | Poet" for a linked persona still named after its craft,
   *  else the display name. */
  titleName: string;
  displayName: string;
  /** Linked personas only, else null. */
  ownerName: string | null;
  kind: SubprofileKind;
  kindLabelKey: string;
  familyLabelKey: string;
  tagline: string | null;
  accent: AccentKey;
  /** One letter for the accent wash when there is no picture. */
  monogram: string;
  image: DirectoryCardImage | null;
  availabilityPill: DirectoryAvailabilityPill | null;
  credits: PortraitCreditsView;
  tags: string[];
  followerCount: number;
  viewerFollowing: boolean;
  viewerIsMember: boolean;
  /** Has an id to follow by, and the viewer is not one of its makers. */
  canFollow: boolean;
}

/** One tile on the hero's wall of faces. */
export interface WallTileView {
  key: string;
  href: string;
  titleName: string;
  kindLabelKey: string;
  accent: AccentKey;
  monogram: string;
  image: DirectoryCardImage | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** A wire accent narrowed to a known key, else the default. */
export function toAccentKey(value: string | null | undefined): AccentKey {
  return value && (ACCENT_OPTIONS as string[]).includes(value)
    ? (value as AccentKey)
    : DEFAULT_ACCENT;
}

function isAvailabilityKey(value: string | null): value is AvailabilityKey {
  return value !== null && Object.hasOwn(AVAILABILITY_PILL_TONE, value);
}

/** The first letter of a name, upper-cased, for the monogram wash. */
export function personaMonogram(name: string): string {
  const firstCharacter = Array.from(name.trim())[0];
  return firstCharacter ? firstCharacter.toLocaleUpperCase() : "?";
}

/** The avatar with its crop, else the banner with its crop, else null. */
export function pickDirectoryCardImage(
  card: SubprofileCardDTO,
): DirectoryCardImage | null {
  if (card.avatarUrl) {
    return {
      src: card.avatarUrl,
      crop: card.crop ?? undefined,
      source: "avatar",
    };
  }
  if (card.coverUrl) {
    return {
      src: card.coverUrl,
      crop: card.coverCrop ?? undefined,
      source: "cover",
    };
  }
  return null;
}

/**
 * The pill a portrait shows for its availability. A tattoo persona reads its
 * books words (open, waitlist), a therapist the words of their page's status
 * pill, everyone else "Open to collabs" or "Taking bookings". Not available,
 * unset or an unknown value draws no pill.
 */
export function directoryAvailabilityPill(
  kind: SubprofileKind,
  availability: string | null,
): DirectoryAvailabilityPill | null {
  if (!isAvailabilityKey(availability) || availability === "not_available") {
    return null;
  }
  const tone = AVAILABILITY_PILL_TONE[availability];
  if (kind === "tattoo_artist") {
    const status = AVAILABILITY_TO_TATTOO_STATUS[availability];
    return { labelKey: tattooStatusLabelKey(status), tone };
  }
  if (kind === "therapist") {
    return { labelKey: THERAPIST_AVAILABILITY_LABEL_KEYS[availability], tone };
  }
  return {
    labelKey:
      availability === "open_to_collabs"
        ? "subprofiles:card.openToCollabs"
        : "subprofiles:availability.booking",
    tone,
  };
}

function toCreditFaceView(face: CreditFaceDTO, index: number): CreditFaceView {
  return {
    key: `${face.kind}-${index}-${face.name}`,
    kind: face.kind,
    name: face.name,
    initials: initialsFromName(face.name, "?"),
    avatarUrl: face.avatarUrl,
    accent: toAccentKey(face.accent),
  };
}

function cardKey(card: SubprofileCardDTO): string {
  return card.id ?? (card.handle || card.slug);
}

function cardTitleName(card: SubprofileCardDTO): string {
  return personaTitleName({
    displayName: card.displayName,
    kind: card.kind,
    // Gated like the card's own `ownerName`: an unlinked card never names its
    // owner, so its title cannot read "Owner | Kind".
    ownerName: card.linkVisibility === "linked" ? card.ownerName : null,
  });
}

// ── Adapters ─────────────────────────────────────────────────────────────────

/** A directory card, with every optional wire field normalized, as the
 *  portrait card draws it. Demo and live cards go through this one path. */
export function toPortraitCardView(card: SubprofileCardDTO): PortraitCardView {
  const id = card.id ?? null;
  const viewerIsMember = card.viewerIsMember ?? false;
  const credits = card.credits;
  return {
    key: cardKey(card),
    id,
    href: personaCardPath(card),
    titleName: cardTitleName(card),
    displayName: card.displayName,
    ownerName: card.linkVisibility === "linked" ? card.ownerName : null,
    kind: card.kind,
    kindLabelKey: KIND_LABEL_KEYS[card.kind],
    familyLabelKey: `subprofiles:family.${skinFor(card.kind)}.label`,
    tagline: card.tagline?.trim() ? card.tagline : null,
    accent: toAccentKey(card.accent),
    monogram: personaMonogram(card.displayName),
    image: pickDirectoryCardImage(card),
    availabilityPill: directoryAvailabilityPill(card.kind, card.availability),
    credits: {
      count: credits?.count ?? 0,
      faces: (credits?.faces ?? []).slice(0, 3).map(toCreditFaceView),
    },
    tags: card.tags,
    followerCount: card.followerCount,
    viewerFollowing: card.viewerFollowing ?? false,
    viewerIsMember,
    canFollow: id !== null && !viewerIsMember,
  };
}

/** A directory card as one tile on the hero's wall of faces. */
export function toWallTileView(card: SubprofileCardDTO): WallTileView {
  return {
    key: cardKey(card),
    href: personaCardPath(card),
    titleName: cardTitleName(card),
    kindLabelKey: KIND_LABEL_KEYS[card.kind],
    accent: toAccentKey(card.accent),
    monogram: personaMonogram(card.displayName),
    image: pickDirectoryCardImage(card),
  };
}

/**
 * The wall's tiles, at most `limit` of them, in the order given. The server
 * (or the demo store) already ordered the wall: the admin's picks, then the
 * fill with photos ahead of tints, so nothing here reorders.
 */
export function selectWallTiles(
  cards: readonly SubprofileCardDTO[],
  limit: number,
): WallTileView[] {
  return cards.slice(0, limit).map(toWallTileView);
}
