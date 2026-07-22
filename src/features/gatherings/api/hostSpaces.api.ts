import { apiGet } from "../../../shared/api/client";

/**
 * Compact partner-venue card from the public `GET /directory/spaces` endpoint
 * (live listings flagged as QueerPulse partner venues). Mirrors the backend's
 * `PartnerSpaceDTO`. `capacity` is a raw int (or `null`) — the frontend
 * composes the localized "up to N" line, per the presentation split.
 */
export interface PartnerSpaceDTO {
  slug: string;
  hood: string;
  name: string;
  spaceType: string;
  capacity: number | null;
  hostNote: string;
}

/** GET /directory/spaces — partner venues for the host page (public). */
export const getPartnerSpaces = () =>
  apiGet<PartnerSpaceDTO[]>("/directory/spaces");
