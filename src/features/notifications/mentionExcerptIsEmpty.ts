import type { ReactNode } from "react";

/**
 * ENG-411. Whether a mention's quoted text is gone. The backend serves
 * `excerpt: ""` once the text that mentioned the member is deleted, edited or
 * taken down, so an empty or whitespace-only excerpt means the source no
 * longer exists. The row shows a muted notice there and offers no reply.
 */
export function isMentionExcerptEmpty(content: ReactNode): boolean {
  return (
    content === null ||
    content === undefined ||
    content === false ||
    (typeof content === "string" && content.trim() === "")
  );
}
