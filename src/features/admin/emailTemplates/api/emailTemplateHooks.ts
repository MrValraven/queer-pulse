import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../api/demoAwareMutation";
import type {
  EmailTemplateAdminDTO,
  EmailTemplateDTO,
  EmailTemplateWriteBody,
} from "../emailTemplate.types";
import type { EmailTemplatePurpose } from "../emailTemplatePurposes";
import {
  createEmailTemplate,
  deleteEmailTemplate,
  getAdminEmailTemplate,
  getAdminEmailTemplates,
  getModEmailTemplates,
  updateEmailTemplate,
} from "./emailTemplates.api";

export const ADMIN_EMAIL_TEMPLATES_KEY = "admin-email-templates";
export const MOD_EMAIL_TEMPLATES_KEY = "mod-email-templates";

async function loadDemoTemplates(): Promise<EmailTemplateAdminDTO[]> {
  const { EMAIL_TEMPLATES_DEMO } = await import("../AdminEmailTemplates.data");
  return EMAIL_TEMPLATES_DEMO;
}

export function useAdminEmailTemplates() {
  const { demoMode } = useDemoMode();
  return useQuery<EmailTemplateAdminDTO[]>({
    queryKey: [ADMIN_EMAIL_TEMPLATES_KEY, "list", demoMode],
    queryFn: () => (demoMode ? loadDemoTemplates() : getAdminEmailTemplates()),
  });
}

/** One template for the editor. Demo resolves to `null` for an unknown id so
 *  the page shows the same not-found state a live 404 does. */
export function useAdminEmailTemplate(id: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<EmailTemplateAdminDTO | null>({
    queryKey: [ADMIN_EMAIL_TEMPLATES_KEY, "one", id, demoMode],
    enabled: id !== null,
    queryFn: async () => {
      if (id === null) return null;
      if (!demoMode) return getAdminEmailTemplate(id);
      const templates = await loadDemoTemplates();
      return templates.find((template) => template.id === id) ?? null;
    },
  });
}

/** Active templates for one purpose, for the approved card's copy action. */
export function useModEmailTemplates(
  purpose: EmailTemplatePurpose,
  options: { isEnabled: boolean },
) {
  const { demoMode } = useDemoMode();
  return useQuery<EmailTemplateDTO[]>({
    queryKey: [MOD_EMAIL_TEMPLATES_KEY, purpose, demoMode],
    enabled: options.isEnabled,
    queryFn: async () => {
      if (!demoMode) return getModEmailTemplates(purpose);
      const templates = await loadDemoTemplates();
      return templates
        .filter((template) => template.isActive && template.purpose === purpose)
        .sort((first, second) => first.sortOrder - second.sortOrder);
    },
  });
}

function useInvalidateTemplates() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: [ADMIN_EMAIL_TEMPLATES_KEY],
    });
    void queryClient.invalidateQueries({ queryKey: [MOD_EMAIL_TEMPLATES_KEY] });
  };
}

export function useCreateEmailTemplate() {
  const { demoMode } = useDemoMode();
  const invalidateTemplates = useInvalidateTemplates();
  return useDemoAwareMutation<
    EmailTemplateAdminDTO | undefined,
    Error,
    EmailTemplateWriteBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the editor shows its own error banner
    demoResult: () => undefined,
    live: (body) => createEmailTemplate(body),
    onLiveSuccess: invalidateTemplates,
  });
}

export interface UpdateEmailTemplateVars {
  id: string;
  body: Partial<EmailTemplateWriteBody>;
}

export function useUpdateEmailTemplate() {
  const { demoMode } = useDemoMode();
  const invalidateTemplates = useInvalidateTemplates();
  return useDemoAwareMutation<
    EmailTemplateAdminDTO | undefined,
    Error,
    UpdateEmailTemplateVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the editor and the list toast locally
    demoResult: () => undefined,
    live: ({ id, body }) => updateEmailTemplate(id, body),
    onLiveSuccess: invalidateTemplates,
  });
}

export function useDeleteEmailTemplate() {
  const { demoMode } = useDemoMode();
  const invalidateTemplates = useInvalidateTemplates();
  return useDemoAwareMutation<void, Error, string>({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // the list page toasts locally
    demoResult: () => undefined,
    live: (id) => deleteEmailTemplate(id),
    onLiveSuccess: invalidateTemplates,
  });
}
