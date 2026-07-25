import { Fragment, type ReactNode } from "react";

// Match http(s):// URLs and bare www. hosts. Trailing sentence punctuation is
// excluded so "see www.x.org." doesn't swallow the period into the href.
const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s<]+[^\s<.,:;!?)\]])/gi;

/** Render `text` with URLs turned into safe new-tab anchors; plain text stays escaped. */
export function renderWithLinks(text: string): ReactNode {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, index) => {
    if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;
    const href = part.startsWith("www.") ? `https://${part}` : part;
    return (
      <a key={index} href={href} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    );
  });
}
