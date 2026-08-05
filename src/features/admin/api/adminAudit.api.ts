import { apiGet } from "../../../shared/api/client";
import { API_BASE_URL } from "../../../shared/api/config";

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
  /** Echoed back from the request — the canonical offset envelope now carries
   *  the page cursor alongside `total`. The hook already knows the page/size it
   *  asked for, so it derives `pageCount` from `total` and its own page size. */
  page: number;
  pageSize: number;
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

// The API version prefix `request()` in `client.ts` applies to every versioned
// call (`/v1/...`). The CSV export is a binary/text attachment, not the JSON the
// `api*` helpers parse, so it goes through a direct `fetch` — but must still hit
// the same versioned path. Kept in step with `client.ts`'s `API_VERSION_PREFIX`.
const API_VERSION_PREFIX = "/v1";

/**
 * Download the governance audit feed as a CSV attachment (P3-8), honouring the
 * same filters as the on-screen feed. A direct credentialed `fetch` (not the
 * JSON `api*` helpers): the backend answers `text/csv` with a
 * `Content-Disposition: attachment`, which we turn into a real browser download
 * via an object URL. GET, so no CSRF token is needed. Throws on a non-2xx so the
 * caller can surface an honest error toast.
 */
export async function downloadAuditCsv(
  params: Omit<AuditFeedParams, "page" | "pageSize">,
): Promise<void> {
  const search = new URLSearchParams();
  if (params.moderator) search.set("moderator", params.moderator);
  if (params.action) search.set("action", params.action);
  if (params.range) search.set("range", params.range);
  if (params.q) search.set("q", params.q);
  const queryString = search.toString();

  const response = await fetch(
    `${API_BASE_URL}${API_VERSION_PREFIX}/mod/audit.csv${
      queryString ? `?${queryString}` : ""
    }`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error(`Audit export failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "governance-audit.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
