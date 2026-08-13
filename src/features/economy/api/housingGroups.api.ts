import { apiGet, apiPost } from "../../../shared/api/client";

export interface GroupScreeningQuestionDTO {
  id: string;
  prompt: string;
  required: boolean;
}

export interface HousingGroupDTO {
  id: string;
  slug: string;
  name: string;
  nameEm: string | null;
  city: string;
  blurb: string;
  isAccessGated: boolean;
  norms: string[];
  screeningQuestions: GroupScreeningQuestionDTO[];
  memberCount: number;
  published: boolean;
}

export interface GroupListingDTO {
  id: string;
  title: string;
  description: string;
  neighbourhood: string;
  priceEuros: number;
  accessibilityInfo: string;
}

export interface GroupJoinRequestBody {
  name: string;
  relationship: string;
  answers?: { questionId: string; answer: string }[];
  note?: string;
}

export const getHousingGroups = () =>
  apiGet<HousingGroupDTO[]>("/housing-groups");

export const getHousingGroup = (slug: string) =>
  apiGet<HousingGroupDTO>(`/housing-groups/${slug}`);

export const getGroupListings = (slug: string) =>
  apiGet<GroupListingDTO[]>(`/housing-groups/${slug}/listings`);

export const submitGroupJoinRequest = (
  slug: string,
  body: GroupJoinRequestBody,
) => apiPost<{ id: string }>(`/housing-groups/${slug}/join-requests`, body);
