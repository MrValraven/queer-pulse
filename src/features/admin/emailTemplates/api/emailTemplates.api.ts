import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../../shared/api/client";
import type {
  EmailTemplateAdminDTO,
  EmailTemplateDTO,
  EmailTemplateWriteBody,
} from "../emailTemplate.types";
import type { EmailTemplatePurpose } from "../emailTemplatePurposes";

/**
 * The email template library. Mirrors the backend's
 * `AdminEmailTemplatesController` (admin authoring) and
 * `EmailTemplatesController` (moderator read for the copy action).
 * Nothing here sends email: templates are copied and sent by hand.
 */
export const getAdminEmailTemplates = () =>
  apiGet<EmailTemplateAdminDTO[]>("/admin/email-templates");

export const getAdminEmailTemplate = (id: string) =>
  apiGet<EmailTemplateAdminDTO>(`/admin/email-templates/${id}`);

export const createEmailTemplate = (body: EmailTemplateWriteBody) =>
  apiPost<EmailTemplateAdminDTO>("/admin/email-templates", body);

export const updateEmailTemplate = (
  id: string,
  body: Partial<EmailTemplateWriteBody>,
) => apiPatch<EmailTemplateAdminDTO>(`/admin/email-templates/${id}`, body);

export const deleteEmailTemplate = (id: string) =>
  apiDelete<void>(`/admin/email-templates/${id}`);

export const getModEmailTemplates = (purpose: EmailTemplatePurpose) =>
  apiGet<EmailTemplateDTO[]>(
    `/mod/email-templates?purpose=${encodeURIComponent(purpose)}`,
  );
