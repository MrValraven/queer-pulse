import { apiGet } from "../../../shared/api/client";
import type { AvatarTone } from "../ui";

export type Standing = "trusted" | "warned" | "new" | "flagged";

export interface TrustNodeDTO {
  id: string;
  /** The member's real account id — distinct from `id`/`slug` (the profile
   *  slug used as the graph's node key). Needed to call an account-level
   *  admin action (e.g. verify) against this node. */
  userId: string;
  slug: string;
  name: string;
  pronouns: string | null;
  initials: string;
  tone: AvatarTone;
  avatarUrl: string | null;
  joinedAt: string;
  standing: Standing;
  sceneId: string | null;
  role: string | null;
  openReportCount: number;
  verified: boolean;
  private: boolean;
}

export interface TrustEdgeDTO {
  id: string;
  from: string;
  to: string;
  mutual: boolean;
  withdrawn: boolean;
  createdAt: string;
  relationship: string | null;
  note: string | null;
  anonymous: boolean;
  kind: "invite" | "vouch";
}

export interface SceneDTO {
  id: string;
  label: string;
  color: string;
}

export interface TrustNetworkDTO {
  nodes: TrustNodeDTO[];
  edges: TrustEdgeDTO[];
  scenes: SceneDTO[];
  truncated: boolean;
}

/** One typeahead result from `GET /admin/trust-network/search` — enough to
 *  render a picker row and jump the graph to `slug` (ADM-10). */
export interface TrustNetworkMemberSearchResultDTO {
  slug: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
}

/**
 * `focus`, when set, pins that member's slug into the returned node set even
 * if their join date falls outside the graph's node cap — so opening the
 * modal for an older member never renders "not found" (ADM-10).
 */
export const getAdminTrustNetwork = (focus?: string) =>
  apiGet<TrustNetworkDTO>(
    `/admin/trust-network${focus ? `?focus=${encodeURIComponent(focus)}` : ""}`,
  );

/** Typeahead behind the graph modal's "find a member" search box (ADM-10). */
export const searchTrustNetworkMembers = (term: string) =>
  apiGet<TrustNetworkMemberSearchResultDTO[]>(
    `/admin/trust-network/search?q=${encodeURIComponent(term)}`,
  );
