import type {
  EmailFillValues,
  EmailPlaceholder,
} from "./emailTemplatePurposes";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const PLACEHOLDER_PATTERN = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;
const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const BOLD_PATTERN = /\*\*([^*]+)\*\*/g;
const ITALIC_PATTERN = /\*([^*]+)\*/g;

export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (character) => HTML_ESCAPES[character] ?? character,
  );
}

/**
 * Replaces each `{token}` that has a value. HTML output passes
 * `shouldEscape: true`, so an applicant called `<b>Kai</b>` can never inject
 * markup, even inside an attribute. A token with no value stays literal.
 */
export function fillPlaceholders(
  text: string,
  values: EmailFillValues,
  shouldEscape: boolean,
): string {
  return text.replace(PLACEHOLDER_PATTERN, (match, token: string) => {
    const value = values[token as EmailPlaceholder];
    if (value === undefined) return match;
    return shouldEscape ? escapeHtml(value) : value;
  });
}

/** True when `text` still carries a `{token}`, e.g. an unfilled invite link
 *  in the "Edit as HTML" render. */
export function hasPlaceholderToken(text: string): boolean {
  return new RegExp(PLACEHOLDER_PATTERN.source).test(text);
}

/** Paragraph mini-markup: `**bold**`, `*italic*`, `[label](url)`, newlines. The
 *  text is escaped FIRST, so only these four constructs become markup. */
export function inlineMarkupToHtml(
  text: string,
  values: EmailFillValues,
  linkColor: string,
): string {
  const html = escapeHtml(text)
    .replace(
      LINK_PATTERN,
      (_match, label: string, url: string) =>
        `<a href="${url}" style="color:${linkColor};text-decoration:underline;">${label}</a>`,
    )
    .replace(BOLD_PATTERN, "<strong>$1</strong>")
    .replace(ITALIC_PATTERN, "<em>$1</em>")
    .replace(/\n/g, "<br>");
  return fillPlaceholders(html, values, true);
}

/** The same paragraph as plain text: links read `label (url)`. */
export function inlineMarkupToText(
  text: string,
  values: EmailFillValues,
): string {
  const plain = text
    .replace(
      LINK_PATTERN,
      (_match, label: string, url: string) => `${label} (${url})`,
    )
    .replace(BOLD_PATTERN, "$1")
    .replace(ITALIC_PATTERN, "$1");
  return fillPlaceholders(plain, values, false);
}

/** Heading mini-markup: only `*word*`, rendered as a coloured italic. Escaped
 *  FIRST and filled LAST, the same order as paragraphs, so neither the text
 *  nor a filled value can add markup. */
export function headingMarkupToHtml(
  text: string,
  values: EmailFillValues,
  emphasisColor: string,
): string {
  const html = escapeHtml(text).replace(
    ITALIC_PATTERN,
    `<em style="font-style:italic;color:${emphasisColor};">$1</em>`,
  );
  return fillPlaceholders(html, values, true);
}

/** The same heading as plain text, asterisks stripped. */
export function headingMarkupToText(
  text: string,
  values: EmailFillValues,
): string {
  return fillPlaceholders(text.replace(ITALIC_PATTERN, "$1"), values, false);
}
