import { apiGet } from "../../../shared/api/client";

/**
 * Live-mode shape of the moderation audit feed (`GET /mod/audit`). Rows are
 * remapped to the shared `AuditRowView` in `useAdminAudit`, alongside demo
 * mode's own `AuditEntry` mock, so the audit tab renders one view either way.
 */
export interface AuditFeedRowDTO {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  reasonCode?: string;
  note?: string;
  subject: string;
  reportId: string | null;
  at: string;
}

export interface AuditFeedResponseDTO {
  items: AuditFeedRowDTO[];
  total: number;
  moderators: { id: string; name: string }[];
}

export interface AuditFeedParams {
  moderator?: string;
  action?: string;
  range?: "today" | "week" | "quarter";
  q?: string;
  page?: number;
  pageSize?: number;
}

export const getAdminAudit = (params: AuditFeedParams) => {
  const search = new URLSearchParams();
  if (params.moderator) search.set("moderator", params.moderator);
  if (params.action) search.set("action", params.action);
  if (params.range) search.set("range", params.range);
  if (params.q) search.set("q", params.q);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  const queryString = search.toString();
  return apiGet<AuditFeedResponseDTO>(
    `/mod/audit${queryString ? `?${queryString}` : ""}`,
  );
};
