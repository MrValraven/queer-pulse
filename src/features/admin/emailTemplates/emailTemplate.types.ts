import type { EmailTemplatePurpose } from "./emailTemplatePurposes";

/**
 * Email template content, mirrored by hand from the backend's
 * `src/email-templates/email-template-content.ts`; change both together.
 *
 * Each language keeps its blocks even while in HTML mode, so "Back to blocks"
 * can restore them. HTML is never parsed back into blocks.
 */
export type EmailSpacerSize = "sm" | "md" | "lg";

export type EmailBlock =
  | { id: string; type: "heading"; text: string; level: 1 | 2 }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "button"; label: string; href: string }
  | { id: string; type: "image"; src: string; alt: string; width: number }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; size: EmailSpacerSize }
  | { id: string; type: "html"; html: string };

export type EmailBlockType = EmailBlock["type"];

export type EmailContentMode = "blocks" | "html";

export interface EmailLocaleContent {
  subject: string;
  mode: EmailContentMode;
  blocks: EmailBlock[];
  /** Set only while `mode` is `html`. */
  html: string | null;
}

export interface EmailTemplateLocales {
  en: EmailLocaleContent;
  pt?: EmailLocaleContent;
}

/** What a moderator's copy action reads (`GET /mod/email-templates`). */
export interface EmailTemplateDTO {
  id: string;
  label: string;
  purpose: EmailTemplatePurpose;
  locales: EmailTemplateLocales;
}

/** The admin library adds ordering, activation and provenance. */
export interface EmailTemplateAdminDTO extends EmailTemplateDTO {
  sortOrder: number;
  isActive: boolean;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** `POST`/`PATCH /admin/email-templates` body. `pt: null` removes Portuguese. */
export interface EmailTemplateWriteBody {
  label: string;
  purpose: EmailTemplatePurpose;
  locales: { en: EmailLocaleContent; pt: EmailLocaleContent | null };
  isActive?: boolean;
}
