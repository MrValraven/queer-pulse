import { apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Mirrors `GovernanceOverviewResponseDTO` (`governance/api/governance.api`)
// plus per-section audit metadata. Backs the admin Policy tab
// (GET/PATCH /admin/governance/overview).

export interface HealthStatDTO {
  key: string;
  n: string;
  up: boolean;
  trendKey: string;
  trendCount?: number;
}
export interface ModerationStepDTO {
  key: string;
}
export interface CouncilSeatDTO {
  name: string;
  initials: string;
  roleKey: string;
  tint: "jade" | "violet" | "plum";
}
export interface PrincipleDTO {
  key: string;
  icon: string;
}
export interface DecisionDTO {
  key: string;
}

export interface AdminOverviewSectionMeta {
  editor: MemberRefDTO | null;
  editedAt: string | null;
}

export interface AdminOverviewMeta {
  health: AdminOverviewSectionMeta;
  moderationSteps: AdminOverviewSectionMeta;
  council: AdminOverviewSectionMeta;
  principles: AdminOverviewSectionMeta;
  decisions: AdminOverviewSectionMeta;
}

export interface AdminOverviewResponseDTO {
  health: HealthStatDTO[];
  moderationSteps: ModerationStepDTO[];
  council: CouncilSeatDTO[];
  principles: PrincipleDTO[];
  decisions: DecisionDTO[];
  meta: AdminOverviewMeta;
}

// ── Update payload ──────────────────────────────────────────────────────────
// Every section is optional; each provided section is a full replacement
// array (supports add/remove/reorder).

export interface UpdateAdminOverviewBody {
  health?: HealthStatDTO[];
  moderationSteps?: ModerationStepDTO[];
  council?: CouncilSeatDTO[];
  principles?: PrincipleDTO[];
  decisions?: DecisionDTO[];
  note?: string;
}

export interface AdminOverviewChangeDTO {
  id: string;
  section: string;
  actor: MemberRefDTO | null;
  before: unknown;
  after: unknown;
  note: string | null;
  createdAt: string;
}

export const getAdminOverview = () =>
  apiGet<AdminOverviewResponseDTO>("/admin/governance/overview");

export const updateAdminOverview = (body: UpdateAdminOverviewBody) =>
  apiPatch<AdminOverviewResponseDTO>("/admin/governance/overview", body);

export const getAdminOverviewChanges = () =>
  apiGet<AdminOverviewChangeDTO[]>("/admin/governance/overview/changes");
