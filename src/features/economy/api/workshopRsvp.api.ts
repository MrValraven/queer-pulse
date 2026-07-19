import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";

/**
 * Reservations for a workshop.
 *
 * Split out of `workshops.api.ts` rather than appended to it: that module is the
 * catalogue (list/detail/create/edit/delete, all host-shaped), while this is the
 * attendee's side of the same resource. The backend splits them the same way
 * (`WorkshopRsvpsService` beside `WorkshopsService`).
 */

/**
 * Where you stand on a workshop. `null` means no booking — including one you
 * made and cancelled, which is the same thing from here.
 *
 * There is no "maybe", unlike an event RSVP: a workshop seat is counted against
 * a cohort size, so it is either held or it isn't.
 */
export type WorkshopRsvpStatus = "going" | "waitlist" | null;

/** The answer to booking or cancelling — carries the fresh counts, so the
 *  sidebar's "3 / 8" and its progress bar update from the same response. */
export interface WorkshopRsvpResultDTO {
  status: Exclude<WorkshopRsvpStatus, null>;
  spotsFilled: number;
  spotsTotal: number;
}

/** The repo-standard member ref the attendees route returns. */
export interface WorkshopAttendeeDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

/** POST /workshops/:slug/rsvp — takes a seat, or joins the queue when full. */
export const rsvpToWorkshop = (slug: string) =>
  apiPost<WorkshopRsvpResultDTO>(`/workshops/${slug}/rsvp`, {});

/** DELETE /workshops/:slug/rsvp — gives the seat back. 204, no body. */
export const cancelWorkshopRsvp = (slug: string) =>
  apiDelete<void>(`/workshops/${slug}/rsvp`);

/**
 * GET /workshops/:slug/attendees — the host and fellow attendees only.
 *
 * Anyone else gets a 403 by design, so this must not be called speculatively:
 * only render it behind `isHost` or a confirmed booking.
 */
export const getWorkshopAttendees = (slug: string) =>
  apiGet<WorkshopAttendeeDTO[]>(`/workshops/${slug}/attendees`);
