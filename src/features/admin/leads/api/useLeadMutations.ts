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
  revertLeadStageChange,
  updateLead,
} from "./leads.api";
import { leadKeys } from "./leadKeys";
import {
  leadReasonOf,
  type CreateLeadBody,
  type LeadDTO,
  type LeadReasonCode,
  type LeadStage,
  type UpdateLeadBody,
} from "./leads.types";

/** Every lead write shares this key, so a page can tell a write is in
 *  flight and ignore a second press. */
export const LEAD_WRITE_KEY = ["admin", "leads", "write"] as const;

/** Refusals that mean the cached lead is stale: the lead, a note or a
 *  history line changed in another tab. */
const STALE_LEAD_REASONS: ReadonlySet<LeadReasonCode> = new Set([
  "LEAD_NOT_FOUND",
  "LEAD_NOTE_NOT_FOUND",
  "LEAD_ENTRY_NOT_FOUND",
  "LEAD_ENTRY_NOT_REVERTIBLE",
]);

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
  const putLead = (lead: LeadDTO) => {
    const detailKey = leadKeys.detail(lead.id, demoMode);
    const cachedLead = queryClient.getQueryData<LeadDTO>(detailKey);
    const isOlderAnswer =
      cachedLead !== undefined &&
      Date.parse(cachedLead.updatedAt) > Date.parse(lead.updatedAt);
    if (!isOlderAnswer) queryClient.setQueryData(detailKey, lead);
  };
  const saveLead = (lead: LeadDTO) => {
    putLead(lead);
    invalidate(leadKeys.listRoot);
    invalidate(leadKeys.dueCountRoot);
  };
  // A list row write waits for the list to read again before it settles,
  // so the row keeps its pending value until the new one arrives and never
  // shows the old stage in between.
  const saveLeadAndReread = async (lead: LeadDTO): Promise<LeadDTO> => {
    putLead(lead);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: leadKeys.listRoot }),
      queryClient.invalidateQueries({ queryKey: leadKeys.dueCountRoot }),
    ]);
    return lead;
  };
  const refreshPersonaSearch = () => invalidate(leadKeys.personaSearchRoot);
  const dropLead = (leadId: string) => {
    queryClient.removeQueries({ queryKey: [...leadKeys.detailRoot, leadId] });
    invalidate(leadKeys.listRoot);
    invalidate(leadKeys.dueCountRoot);
    invalidate(leadKeys.personaSearchRoot);
  };
  // A lead, a note or a history line changed in another tab: the page reads
  // the lead again (a deleted lead lands on its not-found state), and the
  // list follows.
  const refetchIfGone = (cause: unknown, leadId: string) => {
    const reason = leadReasonOf(cause);
    if (reason === null || !STALE_LEAD_REASONS.has(reason)) return;
    invalidate([...leadKeys.detailRoot, leadId]);
    invalidate(leadKeys.listRoot);
    invalidate(leadKeys.dueCountRoot);
  };
  return {
    demoMode,
    saveLead,
    saveLeadAndReread,
    refreshPersonaSearch,
    dropLead,
    refetchIfGone,
  };
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

/** What a quick update from the list sends: the lead and its change. */
export interface LeadQuickUpdate {
  leadId: string;
  body: UpdateLeadBody;
}

/**
 * PATCH /admin/leads/:id from the list, for any row. The list page holds
 * one of these, so a write (and its Undo) still settles after its row
 * leaves the view, for example when the new stage no longer matches the
 * stage filter. It sends only the stage or the follow-up, so the persona
 * search never goes stale here.
 */
export function useQuickUpdateLead(): UseMutationResult<
  LeadDTO,
  Error,
  LeadQuickUpdate
> {
  const { demoMode, saveLeadAndReread, refetchIfGone } = useLeadCache();
  return useDemoAwareMutation<LeadDTO, Error, LeadQuickUpdate>({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async ({ leadId, body }) =>
      saveLeadAndReread((await loadDemoStore()).demoUpdateLead(leadId, body)),
    live: async ({ leadId, body }) =>
      saveLeadAndReread(await updateLead(leadId, body)),
    onError: (cause, { leadId }) => refetchIfGone(cause, leadId),
  });
}

/** What a stage change revert sends: the lead and the `stage_changed` line
 *  to take back. `fromStage` is the stage the lead goes back to, for the
 *  row's pending state; the route reads only the ids. */
export interface LeadStageRevert {
  leadId: string;
  entryId: string;
  fromStage: LeadStage;
}

/**
 * POST /admin/leads/:id/entries/:entryId/revert, the Undo of a stage move
 * from the list. Held by the list page, as {@link useQuickUpdateLead} is,
 * so it settles after its row leaves the view. It answers with the lead, so
 * the caches update as after any other lead write.
 */
export function useRevertLeadStageChange(): UseMutationResult<
  LeadDTO,
  Error,
  LeadStageRevert
> {
  const { demoMode, saveLeadAndReread, refetchIfGone } = useLeadCache();
  return useDemoAwareMutation<LeadDTO, Error, LeadStageRevert>({
    demoMode,
    demoLatencyMs: 0,
    meta: SILENT_META,
    mutationKey: LEAD_WRITE_KEY,
    demoResult: async ({ leadId, entryId }) =>
      saveLeadAndReread(
        (await loadDemoStore()).demoRevertLeadStageChange(leadId, entryId),
      ),
    live: async ({ leadId, entryId }) =>
      saveLeadAndReread(await revertLeadStageChange(leadId, entryId)),
    onError: (cause, { leadId }) => refetchIfGone(cause, leadId),
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
