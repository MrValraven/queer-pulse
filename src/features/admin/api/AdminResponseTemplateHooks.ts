import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ReasonCode } from "../../safety/reportReasons";
import {
  createModResponseTemplate,
  deleteModResponseTemplate,
  getAdminModResponseTemplates,
  getModResponseTemplates,
  reorderModResponseTemplates,
  updateModResponseTemplate,
  type ModActionCodeFilter,
  type ModResponseTemplateAdminDTO,
  type ModResponseTemplateDTO,
  type ModResponseTemplateWriteBody,
} from "./adminModResponseTemplates.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export const MOD_RESPONSE_TEMPLATES_KEY = "mod-response-templates";
export const ADMIN_MOD_RESPONSE_TEMPLATES_KEY = "admin-mod-response-templates";

/**
 * The active templates that fit the decision a moderator is currently making.
 * Demo mode filters the colocated fixture with the same "code or fits-any"
 * rule the backend applies, so the picker behaves identically in both modes.
 *
 * `enabled` is left on unconditionally: the picker is only mounted inside the
 * moderator drawer, which is already behind the moderator role gate.
 */
export function useModResponseTemplates(filter: {
  reasonCode?: ReasonCode | null;
  actionCode?: ModActionCodeFilter;
}) {
  const { demoMode } = useDemoMode();
  const reasonCode = filter.reasonCode ?? null;
  const actionCode = filter.actionCode ?? null;
  return useQuery<ModResponseTemplateDTO[]>({
    queryKey: [MOD_RESPONSE_TEMPLATES_KEY, reasonCode, actionCode, demoMode],
    queryFn: async () => {
      if (!demoMode) {
        return getModResponseTemplates({ reasonCode, actionCode });
      }
      const { ADMIN_RESPONSE_TEMPLATES_DEMO } =
        await import("../AdminResponseTemplates.data");
      return ADMIN_RESPONSE_TEMPLATES_DEMO.filter(
        (template) =>
          template.isActive &&
          (reasonCode === null ||
            template.reasonCode === null ||
            template.reasonCode === reasonCode) &&
          (actionCode === null ||
            template.actionCode === null ||
            template.actionCode === actionCode),
      ).sort((first, second) => first.sortOrder - second.sortOrder);
    },
  });
}

/** Every template, active or not, for the admin management screen. */
export function useAdminModResponseTemplates() {
  const { demoMode } = useDemoMode();
  return useQuery<ModResponseTemplateAdminDTO[]>({
    queryKey: [ADMIN_MOD_RESPONSE_TEMPLATES_KEY, demoMode],
    queryFn: async () => {
      if (!demoMode) return getAdminModResponseTemplates();
      const { ADMIN_RESPONSE_TEMPLATES_DEMO } =
        await import("../AdminResponseTemplates.data");
      return ADMIN_RESPONSE_TEMPLATES_DEMO;
    },
  });
}

/** Both keys, so an edit shows up on the admin screen AND in an open drawer's
 *  picker without a manual refresh. */
function useInvalidateTemplates() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: [ADMIN_MOD_RESPONSE_TEMPLATES_KEY],
    });
    void queryClient.invalidateQueries({
      queryKey: [MOD_RESPONSE_TEMPLATES_KEY],
    });
  };
}

export function useCreateModResponseTemplate() {
  const { demoMode } = useDemoMode();
  const invalidateTemplates = useInvalidateTemplates();
  return useDemoAwareMutation<
    ModResponseTemplateAdminDTO | undefined,
    Error,
    ModResponseTemplateWriteBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminResponseTemplateForm toasts locally
    demoResult: () => undefined,
    live: (body) => createModResponseTemplate(body),
    onLiveSuccess: invalidateTemplates,
  });
}

export interface UpdateModResponseTemplateVars {
  id: string;
  body: Partial<ModResponseTemplateWriteBody>;
}

export function useUpdateModResponseTemplate() {
  const { demoMode } = useDemoMode();
  const invalidateTemplates = useInvalidateTemplates();
  return useDemoAwareMutation<
    ModResponseTemplateAdminDTO | undefined,
    Error,
    UpdateModResponseTemplateVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the form and the page toast locally
    demoResult: () => undefined,
    live: ({ id, body }) => updateModResponseTemplate(id, body),
    onLiveSuccess: invalidateTemplates,
  });
}

export function useDeleteModResponseTemplate() {
  const { demoMode } = useDemoMode();
  const invalidateTemplates = useInvalidateTemplates();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminResponseTemplatesPage toasts locally
    demoResult: () => undefined,
    live: (id) => deleteModResponseTemplate(id),
    onLiveSuccess: invalidateTemplates,
  });
}

export function useReorderModResponseTemplates() {
  const { demoMode } = useDemoMode();
  const invalidateTemplates = useInvalidateTemplates();
  return useDemoAwareMutation<
    ModResponseTemplateAdminDTO[] | undefined,
    Error,
    string[]
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminResponseTemplatesPage toasts locally
    demoResult: () => undefined,
    live: (ids) => reorderModResponseTemplates(ids),
    onLiveSuccess: invalidateTemplates,
  });
}
