import { apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

export type HousingViewingMode = "in_person" | "video";
export type HousingViewingStatus =
  | "requested"
  | "accepted"
  | "declined"
  | "cancelled"
  | "completed";
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
) => apiPost<HousingViewingDTO>(`/housing-viewings/${id}/propose`, { slots, note });

export const declineHousingViewing = (id: string, note?: string) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/decline`, { note });

export const cancelHousingViewing = (id: string) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/cancel`, {});

export const completeHousingViewing = (id: string) =>
  apiPost<HousingViewingDTO>(`/housing-viewings/${id}/complete`, {});
