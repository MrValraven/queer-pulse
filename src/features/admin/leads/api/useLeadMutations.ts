import {
  useIsMutating,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../api/demoAwareMutation";
import {
  addLeadNote,
  createLead,
  deleteLead,
  deleteLeadNote,
  editLeadNote,
  updateLead,
} from "./leads.api";
import { leadKeys } from "./leadKeys";
import {
  leadReasonOf,
  type CreateLeadBody,
  type LeadDTO,
  type UpdateLeadBody,
} from "./leads.types";

/** Every lead write shares this key, so a page can tell a write is in
 *  flight and ignore a second press. */
export const LEAD_WRITE_KEY = ["admin", "leads", "write"] as const;

/** Each control shows its own reason line, so the global toast stays quiet.
 *  No write passes a `logLabel`: lead text never reaches a log. */
const SILENT_META = { silentError: true } as const;

function loadDemoStore() {
  return import("../leadsDemoStore");
}

/**
 * The leads cache. A write that answers with the lead puts it in the detail
 * cache, then the list and the due count read again. In demo the store is
 * the source, so this runs in both modes.
 */
function useLeadCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const invalidate = (queryKey: readonly unknown[]) => {
    void queryClient.invalidateQueries({ queryKey });
  };
  // An answer older than the cached lead (a slow write settling after a
  // newer one) leaves the cache alone, so the newer lead stays on screen.
  const saveLead = (lead: LeadDTO) => {
    const detailKey = leadKeys.detail(lead.id, demoMode);
    const cachedLead = queryClient.getQueryData<LeadDTO>(detailKey);
    const isOlderAnswer =
      cachedLead !== undefined &&
      Date.parse(cachedLead.updatedAt) > Date.parse(lead.updatedAt);
    if (!isOlderAnswer) queryClient.setQueryData(detailKey, lead);
    invalidate(leadKeys.listRoot);
    invalidate(leadKeys.dueCountRoot);
  };
  const refreshPersonaSearch = () => invalidate(leadKeys.personaSearchRoot);
  const dropLead = (leadId: string) => {
    queryClient.removeQueries({ queryKey: [...leadKeys.detailRoot, leadId] });
    invalidate(leadKeys.listRoot);
    invalidate(leadKeys.dueCountRoot);
    invalidate(leadKeys.personaSearchRoot);
  };
  // A lead or a note deleted in another tab: the page reads the lead again
  // (and lands on its not-found state), and the list drops the row.
  const refetchIfGone = (cause: unknown, leadId: string) => {
    const reason = leadReasonOf(cause);
    if (reason !== "LEAD_NOT_FOUND" && reason !== "LEAD_NOTE_NOT_FOUND") return;
    invalidate([...leadKeys.detailRoot, leadId]);
    invalidate(leadKeys.listRoot);
    invalidate(leadKeys.dueCountRoot);
  };
  return { demoMode, saveLead, refreshPersonaSearch, dropLead, refetchIfGone };
}

/** True while any lead write is in flight. */
export function useLeadIsWriting(): boolean {
  return useIsMutating({ mutationKey: LEAD_WRITE_KEY }) > 0;
}

/** POST /admin/leads. */
export function useCreateLead(): UseMutationResult<
  LeadDTO,
  Error,
  CreateLeadBody
> {
  const { demoMode, saveLead } = useLeadCache();
  return useDemoAwareMutation<LeadDTO, Error, CreateLeadBody>({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async (body) => (await loadDemoStore()).demoCreateLead(body),
    live: (body) => createLead(body),
    onSuccess: (lead) => saveLead(lead),
  });
}

/** Refusals that mean the persona search shows a stale link or state: the
 *  persona was linked elsewhere or left the directory meanwhile. */
const STALE_PERSONA_REASONS: ReadonlySet<string> = new Set([
  "LEAD_PERSONA_TAKEN",
  "LEAD_PERSONA_NOT_LISTED",
]);

/** PATCH /admin/leads/:id. A link, an unlink or a new name also refreshes
 *  the persona search, whose results name the lead each persona is linked
 *  to; so does a persona refusal, since the search showed a stale state. */
export function useUpdateLead(
  leadId: string,
): UseMutationResult<LeadDTO, Error, UpdateLeadBody> {
  const { demoMode, saveLead, refreshPersonaSearch, refetchIfGone } =
    useLeadCache();
  return useDemoAwareMutation<LeadDTO, Error, UpdateLeadBody>({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoUpdateLead(leadId, body),
    live: (body) => updateLead(leadId, body),
    onError: (cause) => {
      refetchIfGone(cause, leadId);
      if (STALE_PERSONA_REASONS.has(leadReasonOf(cause) ?? "")) {
        refreshPersonaSearch();
      }
    },
    onSuccess: (lead, body) => {
      saveLead(lead);
      const isPersonaSearchStale =
        body.linkedSubprofileId !== undefined || body.name !== undefined;
      if (isPersonaSearchStale) refreshPersonaSearch();
    },
  });
}

/** DELETE /admin/leads/:id: the detail query goes with the lead. */
export function useDeleteLead(): UseMutationResult<
  { ok: true },
  Error,
  { leadId: string }
> {
  const { demoMode, dropLead, refetchIfGone } = useLeadCache();
  return useDemoAwareMutation<{ ok: true }, Error, { leadId: string }>({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async ({ leadId }) =>
      (await loadDemoStore()).demoDeleteLead(leadId),
    live: ({ leadId }) => deleteLead(leadId),
    onError: (cause, { leadId }) => refetchIfGone(cause, leadId),
    onSuccess: (_answer, { leadId }) => dropLead(leadId),
  });
}

/** POST /admin/leads/:id/entries. */
export function useAddLeadNote(
  leadId: string,
): UseMutationResult<LeadDTO, Error, { body: string }> {
  const { demoMode, saveLead, refetchIfGone } = useLeadCache();
  return useDemoAwareMutation<LeadDTO, Error, { body: string }>({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoAddLeadNote(leadId, body),
    live: (body) => addLeadNote(leadId, body),
    onError: (cause) => refetchIfGone(cause, leadId),
    onSuccess: (lead) => saveLead(lead),
  });
}

/** PATCH /admin/leads/:id/entries/:entryId. */
export function useEditLeadNote(
  leadId: string,
): UseMutationResult<LeadDTO, Error, { entryId: string; body: string }> {
  const { demoMode, saveLead, refetchIfGone } = useLeadCache();
  return useDemoAwareMutation<
    LeadDTO,
    Error,
    { entryId: string; body: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async ({ entryId, body }) =>
      (await loadDemoStore()).demoEditLeadNote(leadId, entryId, { body }),
    live: ({ entryId, body }) => editLeadNote(leadId, entryId, { body }),
    onError: (cause) => refetchIfGone(cause, leadId),
    onSuccess: (lead) => saveLead(lead),
  });
}

/** DELETE /admin/leads/:id/entries/:entryId. */
export function useDeleteLeadNote(
  leadId: string,
): UseMutationResult<LeadDTO, Error, { entryId: string }> {
  const { demoMode, saveLead, refetchIfGone } = useLeadCache();
  return useDemoAwareMutation<LeadDTO, Error, { entryId: string }>({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async ({ entryId }) =>
      (await loadDemoStore()).demoDeleteLeadNote(leadId, entryId),
    live: ({ entryId }) => deleteLeadNote(leadId, entryId),
    onError: (cause) => refetchIfGone(cause, leadId),
    onSuccess: (lead) => saveLead(lead),
  });
}
