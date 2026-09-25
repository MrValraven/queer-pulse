import type { EmailTemplatePurpose } from "./emailTemplatePurposes";

/**
 * Email template content, mirrored by hand from the backend's
 * `src/email-templates/email-template-content.ts`; change both together.
 *
 * Each language keeps its blocks even while in HTML mode, so "Back to blocks"
 * can restore them. HTML is never parsed back into blocks.
 */
export type EmailSpacerSize = "sm" | "md" | "lg";

/** The icons a feature list row can wear. Each one is a hosted PNG listed in
 *  `design/emailAssets.ts`; the backend accepts exactly this list. */
export const EMAIL_FEATURE_ICONS = [
  "communities",
  "gatherings",
  "directory",
  "messages",
  "magazine",
  "safety",
] as const;
export type EmailFeatureIcon = (typeof EMAIL_FEATURE_ICONS)[number];

export interface EmailFeatureItem {
  icon: EmailFeatureIcon;
  title: string;
  text: string;
}

/** A feature list holds one to this many rows. */
export const EMAIL_FEATURE_ITEMS_MAX = 4;

export type EmailBlock =
  | { id: string; type: "heading"; text: string; level: 1 | 2 }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "button"; label: string; href: string }
  | { id: string; type: "image"; src: string; alt: string; width: number }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; size: EmailSpacerSize }
  | { id: string; type: "html"; html: string }
  /** The opening moment. `headline` takes `*italic*` like a heading; `eyebrow`
   *  and `text` may be empty. A design may lift a leading hero into its
   *  masthead. */
  | {
      id: string;
      type: "hero";
      eyebrow: string;
      headline: string;
      text: string;
    }
  /** The invite as a pass: a small label, a large title (e.g. the expiry), a
   *  line of text, and the button inside it. `text` may be empty. */
  | {
      id: string;
      type: "ticket";
      label: string;
      title: string;
      text: string;
      buttonLabel: string;
      href: string;
    }
  | { id: string; type: "featureList"; items: EmailFeatureItem[] }
  /** A person signing the email. `role`, `note` and `photoUrl` may be empty;
   *  without a photo the design shows the pulse mark. */
  | {
      id: string;
      type: "signature";
      name: string;
      role: string;
      note: string;
      photoUrl: string;
    };

export type EmailBlockType = EmailBlock["type"];

export type EmailContentMode = "blocks" | "html";

export interface EmailLocaleContent {
  subject: string;
  /** The grey line an inbox shows after the subject. Optional: rows saved
   *  before it existed have none, and an empty one is not stored. */
  preheader?: string;
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
