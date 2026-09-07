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
/**
 * A council seat as the EDITOR sees it.
 *
 * `memberId` is what the seat stores and what a save sends back: a seat names
 * someone on the platform staff roster, and the backend refuses a save naming
 * anyone else. `member` is the resolved person, for rendering — null when the
 * seat-holder no longer resolves (a deleted account). The public page drops
 * such a seat; this one keeps it, so an admin can see why a seat stopped
 * appearing and fix it rather than watch a row vanish unexplained.
 *
 * `tint` is the colour of the monogram the public page falls back to when the
 * seat-holder shows no photo, so it stays a property of the seat.
 */
export interface CouncilSeatDTO {
  memberId: string;
  member: MemberRefDTO | null;
  roleKey?: string;
  role?: AuthoredTextDTO;
  tint: "jade" | "violet" | "plum";
}

/**
 * One person who may be seated, from `GET
 * /admin/governance/overview/council-candidates` — the platform staff roster,
 * carrying the `id` a seat stores.
 *
 * Served from the admin governance controller rather than `GET /platform/staff`
 * (which every active member can read and which deliberately carries no user
 * ids). The seat keys on that id and not the handle: a handle can be changed,
 * and a seat keyed on one would afterwards point at nobody.
 */
export interface CouncilCandidateDTO {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  platformRole: "moderator" | "admin" | null;
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

/**
 * What a seat looks like on the way BACK to the backend: the id and the role,
 * without the resolved `member` the read added. The API runs
 * `forbidNonWhitelisted`, so echoing `member` back would be a 400.
 */
export interface CouncilSeatEditBody {
  memberId: string;
  roleKey?: string;
  role?: AuthoredTextDTO;
  tint: "jade" | "violet" | "plum";
}

export interface UpdateAdminOverviewBody {
  health?: HealthStatDTO[];
  moderationSteps?: ModerationStepDTO[];
  council?: CouncilSeatEditBody[];
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

export const getCouncilCandidates = () =>
  apiGet<CouncilCandidateDTO[]>(
    "/admin/governance/overview/council-candidates",
  );
