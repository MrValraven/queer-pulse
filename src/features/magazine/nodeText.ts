import { isValidElement, type ReactNode } from "react";

/**
 * Flattens a ReactNode headline/name into plain text, for `<title>` and OG
 * metadata.
 *
 * Magazine view models carry display strings as ReactNode so a coral `<em>`
 * can sit inside them (`Sara <em>Pinheiro.</em>`), but metadata is text only.
 * Shared by `ArticlePage` and `AuthorPage` so both derive the same string.
 */
export function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) {
    const { children } = node.props as { children?: ReactNode };
    return nodeToText(children);
  }
  return "";
}

/** `nodeToText` with whitespace collapsed and a trailing full stop trimmed —
 *  the display names end in one ("Sara <em>Pinheiro.</em>"), which reads wrong
 *  in the middle of a page title. */
export function nodeToTitleText(node: ReactNode): string {
  return nodeToText(node).replace(/\s+/g, " ").trim().replace(/\.$/, "");
}

/** Truncate a blurb to a sensible social-description length. */
export function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 200 ? `${clean.slice(0, 197).trimEnd()}…` : clean;
}

/**
 * A headline as a sentence a person would type: a `<br />` reads as a space
 * and whitespace is collapsed, so the two-line cover title "The city
 * changed.<br />Did we?" keeps its words apart in a shared message.
 */
export function nodeToSentenceText(node: ReactNode): string {
  const flatten = (part: ReactNode): string => {
    if (isValidElement(part) && part.type === "br") return " ";
    if (Array.isArray(part)) return part.map(flatten).join("");
    if (isValidElement(part)) {
      const { children } = part.props as { children?: ReactNode };
      return flatten(children);
    }
    return nodeToText(part);
  };
  return flatten(node).replace(/\s+/g, " ").trim();
}
