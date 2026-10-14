// Persona posts ("Updates"), Studio v3 Phase F
// (QUEERPULSE-STUDIO-V3-ARTIST-TOOLS-CONTRACT-2026-10-13.md). The same
// strings the backend uses; keep them in step.

import {
  STUDIO_ARTIST_PERSONA_KINDS,
  type StudioArtistPersonaKind,
} from "../../studio/api/studio.types";

export const PERSONA_POST = {
  bodyMax: 500,
  linkMax: 1000,
  dailyLimit: 10,
  alertsPerDay: 3,
  pageSize: 10,
  excerptMax: 80,
} as const;

/** Studio artist kinds: every persona kind that releases in Studio posts
 *  updates, read from the one map (spec 2). */
export const PERSONA_POST_KINDS = STUDIO_ARTIST_PERSONA_KINDS;
export type PersonaPostKind = StudioArtistPersonaKind;

const POST_KINDS: ReadonlySet<string> = new Set(PERSONA_POST_KINDS);

/** Studio artist personas post updates. */
export function isPersonaPostKind(kind: string): kind is PersonaPostKind {
  return POST_KINDS.has(kind);
}

export interface PersonaPostDTO {
  id: string;
  body: string;
  linkUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  editedAt: string | null;
  /** The viewer owns or co-owns the persona. */
  canEdit: boolean;
}

export interface PersonaPostPageDTO {
  items: PersonaPostDTO[];
  pageInfo: { nextCursor: string | null; hasMore: boolean };
}

export interface CreatePersonaPostBody {
  body: string;
  linkUrl?: string;
  /** A key from the persona image upload (`work-image`). */
  imageKey?: string;
}

/** null clears the link or the photo. */
export interface UpdatePersonaPostBody {
  body?: string;
  linkUrl?: string | null;
  imageKey?: string | null;
}

export const PERSONA_POST_ERROR_CODES = [
  "persona_posts_not_available",
  "persona_post_image_not_allowed",
  "persona_post_daily_limit",
] as const;
export type PersonaPostErrorCode = (typeof PERSONA_POST_ERROR_CODES)[number];
