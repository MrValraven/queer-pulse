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
/**
 * PRD-265. The EN/PT an editor typed for an entry with no i18n key. Both
 * languages are required by the backend: nothing on this platform will ever go
 * back and translate a governance entry later, so the moment it is written is
 * the only moment the second language can be got.
 */
export interface AuthoredTextDTO {
  en: string;
  pt: string;
}

/**
 * A council seat, a principle and a decision each come in one of two forms and
 * the backend enforces the exclusive-or (`IsSeededOrAuthored`):
 *
 *  - SEEDED — `key` (or `roleKey`), one of the fixed content keys whose EN+PT
 *    already live in the frontend catalogs. Its words are not editable here;
 *    they are in the bundle.
 *  - AUTHORED — the editor's own EN/PT text, for everything added after the
 *    bundle shipped. This is what makes the record growable without a deploy.
 */
export interface CouncilSeatDTO {
  name: string;
  initials: string;
  roleKey?: string;
  role?: AuthoredTextDTO;
  tint: "jade" | "violet" | "plum";
}
export interface PrincipleDTO {
  key?: string;
  title?: AuthoredTextDTO;
  text?: AuthoredTextDTO;
  icon: string;
}
export interface DecisionDTO {
  key?: string;
  lead?: AuthoredTextDTO;
  body?: AuthoredTextDTO;
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
