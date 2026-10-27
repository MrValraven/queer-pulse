import { apiGet } from "../../../shared/api/client";
import type { EventCardDTO } from "../../gatherings/api/events.api";

/** How the member stands on an event: the host, or one of its co-hosts. */
export type ProfileEventRole = "host" | "cohost";

/** The `GET /events` card, plus the member's role on it. */
export type ProfileEventCardDTO = EventCardDTO & { role: ProfileEventRole };

/**
 * `GET /profiles/:slug/events`. The server caps `upcoming` at 12 (soonest
 * first) and `past` at 6 (latest first), and answers a limited profile with
 * two empty lists.
 */
export interface ProfileEventsDTO {
  upcoming: ProfileEventCardDTO[];
  past: ProfileEventCardDTO[];
}

/** The events a member hosts or co-hosts, for their profile's Events section.
 *  Members only; a profile the viewer cannot see answers 404. */
export const getProfileEvents = (slug: string, signal?: AbortSignal) =>
  apiGet<ProfileEventsDTO>(
    `/profiles/${encodeURIComponent(slug)}/events`,
    undefined,
    undefined,
    signal,
  );
