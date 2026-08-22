import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";
import type {
  AdminRoadmapIdeaDTO,
  AdminRoadmapItemDTO,
  RoadmapAdminHeroStatDTO,
  RoadmapAdminResponseDTO,
  RoadmapAuditEntryDTO,
  RoadmapAuditQueryParams,
  RoadmapBulkItemsBody,
  RoadmapDeclineReason,
  RoadmapIdeaUpdateBody,
  RoadmapItemUpdateBody,
  RoadmapItemWriteBody,
  RoadmapTeamMemberDTO,
  RoadmapTeamMemberUpdateBody,
  RoadmapTeamMemberWriteBody,
  RoadmapUpdateDepsBody,
} from "./roadmapAdmin.types";

// Fetch functions for the NestJS `roadmap` domain's admin surface
// (`/admin/roadmap/*`). Every DTO/write-body type these use lives in the
// colocated `roadmapAdmin.types.ts` (split out purely for file size) — this
// file re-exports all of them so existing `from "./roadmapAdmin.api"` imports
// keep working unchanged. `export type *`, not `export *`, because
// `roadmapAdmin.types.ts` holds only type/interface exports and this repo's
// `verbatimModuleSyntax` requires that distinction be explicit.
export type * from "./roadmapAdmin.types";

/** Every roadmap item/idea, published or not, plus the team roster, the
 *  recent audit trail, and the hero-stat chips. */
export const getAdminRoadmap = () =>
  apiGet<RoadmapAdminResponseDTO>("/admin/roadmap");

// ── Items ───────────────────────────────────────────────────────────────────

export const createRoadmapItem = (body: RoadmapItemWriteBody) =>
  apiPost<AdminRoadmapItemDTO>("/admin/roadmap/items", body);

export const updateRoadmapItem = (id: string, body: RoadmapItemUpdateBody) =>
  apiPatch<AdminRoadmapItemDTO>(`/admin/roadmap/items/${id}`, body);

export const deleteRoadmapItem = (id: string) =>
  apiDelete<void>(`/admin/roadmap/items/${id}`);

export const updateItemDeps = (id: string, body: RoadmapUpdateDepsBody) =>
  apiPatch<AdminRoadmapItemDTO>(`/admin/roadmap/items/${id}/deps`, body);

export const duplicateRoadmapItem = (id: string) =>
  apiPost<AdminRoadmapItemDTO>(`/admin/roadmap/items/${id}/duplicate`);

/** The item's `column` is left untouched; only the `archived` flag flips.
 *  `false` restores it from the Archive view. */
export const archiveRoadmapItem = (id: string, archived: boolean) =>
  apiPatch<AdminRoadmapItemDTO>(`/admin/roadmap/items/${id}/archive`, {
    archived,
  });

/** A best-effort notification blast to everyone who voted for the item;
 *  sets `notified: true` on it. */
export const notifyVoters = (id: string, message: string) =>
  apiPost<{ notified: number }>(`/admin/roadmap/items/${id}/notify`, {
    message,
  });

export const bulkItems = (body: RoadmapBulkItemsBody) =>
  apiPatch<{ count: number }>("/admin/roadmap/items/bulk", body);

// ── Ideas ───────────────────────────────────────────────────────────────────

/** Admin-authored ideas post straight to "published" (no triage needed). */
export const createRoadmapIdea = (text: string) =>
  apiPost<AdminRoadmapIdeaDTO>("/admin/roadmap/ideas", { text });

export const updateRoadmapIdea = (id: string, body: RoadmapIdeaUpdateBody) =>
  apiPatch<AdminRoadmapIdeaDTO>(`/admin/roadmap/ideas/${id}`, body);

export const deleteRoadmapIdea = (id: string) =>
  apiDelete<void>(`/admin/roadmap/ideas/${id}`);

/** Creates an item from the idea, carries its votes over, and removes the
 *  idea from the queue. */
export const promoteIdea = (id: string) =>
  apiPost<AdminRoadmapItemDTO>(`/admin/roadmap/ideas/${id}/promote`);

/** Folds a pending idea into an existing item: moves its live votes onto
 *  `intoItemId`, sets that item's `requested: true`, and deletes the idea. */
export const mergeIdea = (id: string, intoItemId: string) =>
  apiPost<AdminRoadmapItemDTO>(`/admin/roadmap/ideas/${id}/merge`, {
    intoItemId,
  });

/** Moves the idea to `status: 'dismissed'` with a reason + member-facing
 *  note; when `reason` is set the idea also surfaces on the public
 *  "Not building this, and why" section. */
export const declineIdea = (
  id: string,
  reason: RoadmapDeclineReason,
  note: string,
) =>
  apiPost<AdminRoadmapIdeaDTO>(`/admin/roadmap/ideas/${id}/decline`, {
    reason,
    note,
  });

// ── Team ────────────────────────────────────────────────────────────────────

/** The team bundle also comes back on `getAdminRoadmap()`; this standalone
 *  GET exists for callers that only need a fresh roster (e.g. after a team
 *  mutation) without refetching the whole admin bundle. */
export const listRoadmapTeam = () =>
  apiGet<RoadmapTeamMemberDTO[]>("/admin/roadmap/team");

export const createTeamMember = (body: RoadmapTeamMemberWriteBody) =>
  apiPost<RoadmapTeamMemberDTO>("/admin/roadmap/team", body);

export const updateTeamMember = (
  id: string,
  body: RoadmapTeamMemberUpdateBody,
) => apiPatch<RoadmapTeamMemberDTO>(`/admin/roadmap/team/${id}`, body);

export const deleteTeamMember = (id: string) =>
  apiDelete<void>(`/admin/roadmap/team/${id}`);

// ── Audit ───────────────────────────────────────────────────────────────────

export const getRoadmapAudit = (params: RoadmapAuditQueryParams = {}) => {
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.before) search.set("before", params.before);
  const queryString = search.toString();
  return apiGet<RoadmapAuditEntryDTO[]>(
    `/admin/roadmap/audit${queryString ? `?${queryString}` : ""}`,
  );
};

// `GET /admin/audit.csv` answers `text/csv`, not JSON — the shared
// `apiGet`/`request()` pipeline in `shared/api/client.ts` always
// `JSON.parse()`s the response body (P1-12's malformed-response guard), so it
// cannot be reused here; a CSV body would fail that parse and surface as a
// spurious `ApiError(422, "Malformed JSON…")`. This performs its own
// unversioned-style raw fetch (mirrors `postUnversioned`'s pattern in
// `client.ts`) and returns the text directly. GET is a safe method, so no
// CSRF token is needed; a 401 here surfaces as a thrown `Error` rather than
// going through the shared client's refresh-and-retry — acceptable for a
// download button the admin only reaches from an already-authenticated
// session (Task C4's Audit Log modal "Export CSV").
export async function getRoadmapAuditCsv(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/v1/admin/roadmap/audit.csv`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to download the audit CSV (${res.status}).`);
  }
  return res.text();
}

// ── Settings ────────────────────────────────────────────────────────────────

export const updateRoadmapSettings = (heroStats: RoadmapAdminHeroStatDTO[]) =>
  apiPatch<{ heroStats: RoadmapAdminHeroStatDTO[] }>(
    "/admin/roadmap/settings",
    { heroStats },
  );
