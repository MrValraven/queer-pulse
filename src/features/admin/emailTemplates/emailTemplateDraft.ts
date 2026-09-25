import type {
  EmailBlock,
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

/** Every admin-written string in one block that may carry a `{token}`. */
function blockTexts(block: EmailBlock): string[] {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return [block.text];
    case "button":
      return [block.label, block.href];
    case "image":
      return [block.alt];
    case "html":
      return [block.html];
    case "hero":
      return [block.eyebrow, block.headline, block.text];
    case "ticket":
      return [
        block.label,
        block.title,
        block.text,
        block.buttonLabel,
        block.href,
      ];
    case "featureList":
      return block.items.flatMap((item) => [item.title, item.text]);
    case "signature":
      return [block.name, block.role, block.note, block.photoUrl];
    case "divider":
    case "spacer":
      return [];
  }
}

/** Tokens the purpose does not allow anywhere in one language, for the inline
 *  warning the editor shows before the backend would refuse the save. */
export function unknownTokensIn(
  content: EmailLocaleContent,
  purpose: EmailTemplatePurpose,
): string[] {
  const texts = [
    content.subject,
    content.preheader ?? "",
    content.mode === "html" ? (content.html ?? "") : "",
  ];
  for (const block of content.blocks) texts.push(...blockTexts(block));
  return unknownPlaceholders(texts.join("\n"), purpose);
}
