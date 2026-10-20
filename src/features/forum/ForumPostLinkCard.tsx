import { StudioPostCard } from "../studio/share/StudioPostCard";
import { ForumLinkPreview } from "./ForumLinkPreview";
import type { ForumPostLink } from "./forumPostLink";

/** The one card under a forum post: the Studio card for a Studio link, else
 *  the OpenGraph unfurl. `isEnabled` gates the loading of either card (the
 *  unfurl's shared rate budget, the Studio card's reads), so a post out of
 *  view or in a folded branch requests nothing. The Studio card holds its
 *  fixed frame until then, so the thread never shifts. */
export function ForumPostLinkCard({
  link,
  isEnabled,
}: {
  link: ForumPostLink;
  isEnabled: boolean;
}) {
  if (link.studioTarget) {
    return <StudioPostCard target={link.studioTarget} shouldLoad={isEnabled} />;
  }
  return <ForumLinkPreview url={link.previewUrl} isEnabled={isEnabled} />;
}
