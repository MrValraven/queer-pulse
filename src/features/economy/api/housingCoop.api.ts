import { apiGet, apiPost } from "../../../shared/api/client";

export interface CoopFaceDTO {
  initials: string;
  tint: "coral" | "jade" | "plum";
}

export interface HousingCoopDTO {
  id: string;
  slug: string;
  name: string;
  nameEm: string | null;
  city: string;
  area: string;
  householdCount: number;
  phase: "forming" | "legal" | "finance" | "property" | "daily";
  progress: number;
  operational: boolean;
  operationalSince: string | null;
  formingSince: string | null;
  description: string;
  shareAmountEuros: number | null;
  monthlyEuros: number | null;
  sharesAreTarget: boolean;
  ctaKind: "join" | "updates" | "mentor";
  faces: CoopFaceDTO[];
  published: boolean;
  operatorVerified: boolean;
}

export interface CoopJoinRequestBody {
  name: string;
  householdSize: string;
  note?: string;
}

export const getHousingCoops = () =>
  apiGet<HousingCoopDTO[]>("/housing/coops");

export const submitCoopJoinRequest = (
  slug: string,
  body: CoopJoinRequestBody,
) => apiPost<{ id: string }>(`/housing/coops/${slug}/join-requests`, body);
