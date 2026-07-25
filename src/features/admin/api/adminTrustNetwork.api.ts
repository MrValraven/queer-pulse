import { apiGet } from "../../../shared/api/client";
import type { AvatarTone } from "../ui";

export type Standing = "trusted" | "warned" | "new" | "flagged";

export interface TrustNodeDTO {
  id: string;
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

export const getAdminTrustNetwork = () =>
  apiGet<TrustNetworkDTO>("/admin/trust-network");
