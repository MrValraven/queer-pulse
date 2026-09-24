import type {
  EmailLocaleContent,
  EmailTemplateAdminDTO,
  EmailTemplateWriteBody,
} from "./emailTemplate.types";
import {
  unknownPlaceholders,
  type EmailTemplatePurpose,
} from "./emailTemplatePurposes";
import { createBlock, withFreshIds } from "./editor/emailBlockOps";

export interface EmailTemplateDraft {
  label: string;
  purpose: EmailTemplatePurpose;
  isActive: boolean;
  locales: { en: EmailLocaleContent; pt: EmailLocaleContent | null };
}

export function emptyLocaleContent(): EmailLocaleContent {
  return {
    subject: "",
    mode: "blocks",
    blocks: [createBlock("paragraph")],
    html: null,
  };
}

export function newDraft(): EmailTemplateDraft {
  return {
    label: "",
    purpose: "invite_approved",
    isActive: true,
    locales: { en: emptyLocaleContent(), pt: null },
  };
}

export function draftFromTemplate(
  template: EmailTemplateAdminDTO,
): EmailTemplateDraft {
  return {
    label: template.label,
    purpose: template.purpose,
    isActive: template.isActive,
    locales: { en: template.locales.en, pt: template.locales.pt ?? null },
  };
}

export function toWriteBody(draft: EmailTemplateDraft): EmailTemplateWriteBody {
  return {
    label: draft.label.trim(),
    purpose: draft.purpose,
    isActive: draft.isActive,
    locales: { en: draft.locales.en, pt: draft.locales.pt },
  };
}

/** Portuguese starts as a copy of English (same subject and blocks, new ids),
 *  so a translator edits in place instead of rebuilding the layout. */
export function portugueseFromEnglish(
  english: EmailLocaleContent,
): EmailLocaleContent {
  return { ...english, blocks: withFreshIds(english.blocks) };
}

/** "Edit as HTML": keep the blocks, take the rendered HTML (tokens unfilled). */
export function switchToHtml(
  content: EmailLocaleContent,
  renderedHtml: string,
): EmailLocaleContent {
  return { ...content, mode: "html", html: renderedHtml };
}

/** "Back to blocks": drop the custom HTML, restore the kept blocks. */
export function switchToBlocks(
  content: EmailLocaleContent,
): EmailLocaleContent {
  return { ...content, mode: "blocks", html: null };
}

export function isSameContent(first: unknown, second: unknown): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

/** Tokens the purpose does not allow anywhere in one language, for the inline
 *  warning the editor shows before the backend would refuse the save. */
export function unknownTokensIn(
  content: EmailLocaleContent,
  purpose: EmailTemplatePurpose,
): string[] {
  const texts = [
    content.subject,
    content.mode === "html" ? (content.html ?? "") : "",
  ];
  for (const block of content.blocks) {
    if (block.type === "heading" || block.type === "paragraph")
      texts.push(block.text);
    if (block.type === "button") texts.push(block.label, block.href);
    if (block.type === "image") texts.push(block.alt);
    if (block.type === "html") texts.push(block.html);
  }
  return unknownPlaceholders(texts.join("\n"), purpose);
}
