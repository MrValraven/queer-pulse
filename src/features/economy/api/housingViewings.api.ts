import { apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

export type HousingViewingMode = "in_person" | "video";
export type HousingViewingStatus =
  "requested" | "accepted" | "declined" | "cancelled" | "completed";
export type HousingViewingParty = "requester" | "lister";

/** One viewing, always from the calling member's perspective (`role` is who you
 * are on it; `counterparty` is the other person). */
export interface HousingViewingDTO {
  id: string;
  listingRef: string;
  listingSlug: string;
  listingTitle: string;
  role: HousingViewingParty;
  counterparty: MemberRefDTO | null;
  mode: HousingViewingMode;
  status: HousingViewingStatus;
  proposedBy: HousingViewingParty;
  /** True when you made the proposal currently on the table (so you wait). */
  youProposedLast: boolean;
  proposedSlots: string[];
  acceptedSlot: string | null;
  note: string;
  responseNote: string | null;
  createdAt: string;
  updatedAt: string;
  /**
   * ENG-467: either side may call the viewing off while it is requested or
   * accepted. Optional so an older backend still parses; when absent, only a
   * request can be cancelled, as before.
   */
  canCancel?: boolean;
  /**
   * PRD-446: true once the viewing is accepted AND its slot has passed. When
   * absent, an accepted viewing offers "Mark completed" straight away, as
   * before.
   */
  canComplete?: boolean;
  /**
   * True while the home can still be booked from your side: live, present,
   * unfilled, unexpired, clear of a takedown, and with no block either way
   * between you and the lister. "Request another time" shows only when this is
   * true, so an older backend that leaves it out hides the offer.
   */
  isListingOpen?: boolean;
  /**
   * True once the lister deleted the home. A completed viewing on a deleted
   * home offers no review, while a filled home stays reviewable.
   */
  isListingDeleted?: boolean;
}

export interface RequestViewingBody {
  listingRef: string;
  mode: HousingViewingMode;
  proposedSlots: string[];
  note?: string;
}

export const getMyHousingViewings = () =>
  apiGet<HousingViewingDTO[]>("/housing-viewings/mine");

export const requestHousingViewing = (body: RequestViewingBody) =>
  apiPost<HousingViewingDTO>("/housing-viewings", body);

export const acceptHousingViewing = (id: string, slot: string) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/accept`, { slot });

export const proposeHousingViewing = (
  id: string,
  slots: string[],
  note?: string,
) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/propose`, {
    slots,
    note,
  });

export const declineHousingViewing = (id: string, note?: string) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/decline`, { note });

export const cancelHousingViewing = (id: string) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/cancel`, {});

export const completeHousingViewing = (id: string) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/complete`, {});
