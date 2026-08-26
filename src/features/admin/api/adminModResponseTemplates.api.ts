import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import type { ReasonCode } from "../../safety/reportReasons";
import type { ModActionCode } from "./moderation.api";

// Re-exported so the admin screen and the picker have one import for the whole
// contract instead of reaching into the queue's API module for the action set.
export type { ModActionCode };

/**
 * The moderator response library: admin-authored, reason-keyed member-facing
 * notes a moderator can prefill into a decision instead of typing the whole
 * explanation from scratch. Mirrors the backend's
 * `ModResponseTemplatesController` (moderator read) and
 * `AdminModResponseTemplatesController` (authoring CRUD).
 *
 * A template id is NEVER stored on a moderation action. The picker resolves
 * the placeholders, the moderator edits the result, and the text they approved
 * is what `PATCH /mod/reports/:id` persists. Editing a template afterwards
 * cannot change what a member was already told.
 */

/** The drawer's action selection before one is chosen, and after: the picker
 *  narrows by action only once the moderator has picked one. */
export type ModActionCodeFilter = ModActionCode | null | undefined;

/** What a moderator sees in the picker. */
export interface ModResponseTemplateDTO {
  id: string;
  /** Moderator-facing name. Never shown to the member. */
  label: string;
  /** Member-facing text, still holding its `{member}` / `{community}` tokens. */
  body: string;
  /** The reason this template is keyed to. `null` means it fits any reason. */
  reasonCode: ReasonCode | null;
  /** The action this template suits. `null` means it fits any action. */
  actionCode: ModActionCode | null;
}

/** The admin view adds ordering, activation and provenance. */
export interface ModResponseTemplateAdminDTO extends ModResponseTemplateDTO {
  sortOrder: number;
  isActive: boolean;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModResponseTemplateWriteBody {
  label: string;
  body: string;
  reasonCode: ReasonCode | null;
  actionCode: ModActionCode | null;
  isActive?: boolean;
}

/** Active templates for the decision in front of a moderator. Each filter
 *  matches its own code plus the untargeted ("fits any") rows, server-side. */
export function getModResponseTemplates(filter: {
  reasonCode?: ReasonCode | null;
  actionCode?: ModActionCode | null;
}): Promise<ModResponseTemplateDTO[]> {
  const params = new URLSearchParams();
  if (filter.reasonCode) params.set("reasonCode", filter.reasonCode);
  if (filter.actionCode) params.set("actionCode", filter.actionCode);
  const query = params.toString();
  return apiGet<ModResponseTemplateDTO[]>(
    `/mod/response-templates${query ? `?${query}` : ""}`,
  );
}

export const getAdminModResponseTemplates = () =>
  apiGet<ModResponseTemplateAdminDTO[]>("/admin/mod-response-templates");

export const createModResponseTemplate = (body: ModResponseTemplateWriteBody) =>
  apiPost<ModResponseTemplateAdminDTO>("/admin/mod-response-templates", body);

export const updateModResponseTemplate = (
  id: string,
  body: Partial<ModResponseTemplateWriteBody>,
) =>
  apiPatch<ModResponseTemplateAdminDTO>(
    `/admin/mod-response-templates/${id}`,
    body,
  );

export const deleteModResponseTemplate = (id: string) =>
  apiDelete<void>(`/admin/mod-response-templates/${id}`);

/** Rewrites the whole display order. Sending every id (rather than one row's
 *  new position) means two admins reordering at once end up with a coherent
 *  order instead of a half-applied shuffle. */
export const reorderModResponseTemplates = (ids: string[]) =>
  apiPut<ModResponseTemplateAdminDTO[]>("/admin/mod-response-templates/order", {
    ids,
  });
