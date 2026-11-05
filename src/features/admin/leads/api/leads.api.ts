import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../../shared/api/client";
import type {
  CreateLeadBody,
  LeadDTO,
  LeadListFilters,
  LeadListPageDTO,
  LeadPersonaSearchResultDTO,
  UpdateLeadBody,
} from "./leads.types";

/**
 * The admin leads routes (contract section 4.2, `@Controller('admin/leads')`,
 * Admin or the `music_manager_producer` grant). Every write but the lead
 * delete answers with the whole refreshed lead.
 */
const LEADS_PATH = "/admin/leads";

const leadPathOf = (leadId: string): string =>
  `${LEADS_PATH}/${encodeURIComponent(leadId)}`;

const entryPathOf = (leadId: string, entryId: string): string =>
  `${leadPathOf(leadId)}/entries/${encodeURIComponent(entryId)}`;

/** GET /admin/leads: one page. Only the filters that are set ride along;
 *  the cursor resends the same filters. */
export const getLeads = (
  filters: LeadListFilters,
  cursor: string | null,
  signal?: AbortSignal,
): Promise<LeadListPageDTO> => {
  const params = new URLSearchParams();
  const term = filters.q.trim();
  if (term !== "") params.set("q", term);
  if (filters.stage !== null) params.set("stage", filters.stage);
  if (filters.type !== null) params.set("type", filters.type);
  if (filters.isDueOnly) params.set("due", "true");
  if (cursor !== null) params.set("cursor", cursor);
  const queryString = params.toString();
  return apiGet<LeadListPageDTO>(
    queryString === "" ? LEADS_PATH : `${LEADS_PATH}?${queryString}`,
    undefined,
    undefined,
    signal,
  );
};

/** GET /admin/leads/due-count: open leads whose follow-up is today or past. */
export const getLeadDueCount = (
  signal?: AbortSignal,
): Promise<{ count: number }> =>
  apiGet<{ count: number }>(
    `${LEADS_PATH}/due-count`,
    undefined,
    undefined,
    signal,
  );

/** GET /admin/leads/:id: the lead with every history line, newest first. */
export const getLead = (
  leadId: string,
  signal?: AbortSignal,
): Promise<LeadDTO> =>
  apiGet<LeadDTO>(leadPathOf(leadId), undefined, undefined, signal);

/** POST /admin/leads: the lead, its created line and its first note. */
export const createLead = (body: CreateLeadBody): Promise<LeadDTO> =>
  apiPost<LeadDTO>(LEADS_PATH, body);

/** PATCH /admin/leads/:id: only the properties sent change. */
export const updateLead = (
  leadId: string,
  body: UpdateLeadBody,
): Promise<LeadDTO> => apiPatch<LeadDTO>(leadPathOf(leadId), body);

/** DELETE /admin/leads/:id: the lead and its whole history. */
export const deleteLead = (leadId: string): Promise<{ ok: true }> =>
  apiDelete<{ ok: true }>(leadPathOf(leadId));

/** POST /admin/leads/:id/entries: a note by the caller. */
export const addLeadNote = (
  leadId: string,
  body: { body: string },
): Promise<LeadDTO> => apiPost<LeadDTO>(`${leadPathOf(leadId)}/entries`, body);

/** PATCH /admin/leads/:id/entries/:entryId: a note's new text. */
export const editLeadNote = (
  leadId: string,
  entryId: string,
  body: { body: string },
): Promise<LeadDTO> => apiPatch<LeadDTO>(entryPathOf(leadId, entryId), body);

/** DELETE /admin/leads/:id/entries/:entryId: removes a note. */
export const deleteLeadNote = (
  leadId: string,
  entryId: string,
): Promise<LeadDTO> => apiDelete<LeadDTO>(entryPathOf(leadId, entryId));

/** `GET /admin/leads/personas/search` answers with a wrapped list. */
interface LeadPersonaSearchResponseDTO {
  items: LeadPersonaSearchResultDTO[];
}

/** GET /admin/leads/personas/search?q=: listed personas, at most 20, each
 *  with the lead it is linked to. `@` searches handles. */
export const searchLeadPersonas = async (
  query: string,
  signal?: AbortSignal,
): Promise<LeadPersonaSearchResultDTO[]> =>
  (
    await apiGet<LeadPersonaSearchResponseDTO>(
      `${LEADS_PATH}/personas/search?q=${encodeURIComponent(query)}`,
      undefined,
      undefined,
      signal,
    )
  ).items;
