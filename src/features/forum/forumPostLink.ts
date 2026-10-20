import type { StudioLinkTarget } from "../studio/share/studioLinkTarget";
import { splitStudioPostText } from "../studio/share/studioPostText";
import { firstLinkIn } from "./api/useForumLinkPreview";

/** What a forum post's body renders: its text and at most one link card. */
export interface ForumPostLink {
  /** The paragraphs joined for MarkdownLite, minus a Studio link that stood
   *  on its own (a markdown-labelled one stays as the reader's link). */
  visibleText: string;
  /** The first Studio link's card, or null. */
  studioTarget: StudioLinkTarget | null;
  /** The OpenGraph link for `ForumLinkPreview`; null whenever the post has a
   *  Studio card, so a post shows one card. */
  previewUrl: string | null;
}

/** `paragraphs` is the adapters' split body; `join("\n")` is its exact
 *  inverse, which the edit flow already relies on. */
export function forumPostLink(paragraphs: string[]): ForumPostLink {
  const { target, visibleText } = splitStudioPostText(paragraphs.join("\n"));
  return {
    visibleText,
    studioTarget: target,
    previewUrl: target ? null : firstLinkIn(paragraphs),
  };
}
