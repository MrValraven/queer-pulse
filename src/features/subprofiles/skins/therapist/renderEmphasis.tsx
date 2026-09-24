import type { ReactNode } from "react";

/** Turns `*word*` spans into `<em>` (the coral italic emphasis in section
 *  headings and the hero quote). Text without asterisks comes back as is. */
export function renderEmphasis(text: string): ReactNode {
  const parts = text.split(/\*([^*]+)\*/);
  if (parts.length === 1) return text;
  // split() with one capture group alternates plain text and captured
  // emphasis, so every odd index is an emphasised span.
  return parts.map((part, index) =>
    index % 2 === 1 ? <em key={index}>{part}</em> : part,
  );
}
