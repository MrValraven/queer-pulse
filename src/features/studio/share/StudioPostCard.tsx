import { LazyStudioShareCard } from "./LazyStudioShareCard";
import {
  StudioShareCardFrame,
  StudioShareCardPlaceholder,
} from "./StudioShareCardFrame";
import type { StudioLinkTarget } from "./studioLinkTarget";
import styles from "./StudioPostCard.module.css";

/**
 * The Studio card under a post's words (board, Discussion, forum, persona
 * page). The card keeps one fixed size in every state, so a post never
 * changes height after mount. `isInteractive` false (an editor preview)
 * makes the whole card inert. `shouldLoad` false holds the card's fixed
 * frame with its loading shapes and loads nothing, for a post still out of
 * view or inside a folded branch; the card loads once it turns true.
 */
export function StudioPostCard({
  target,
  isInteractive = true,
  shouldLoad = true,
}: {
  target: StudioLinkTarget;
  isInteractive?: boolean;
  shouldLoad?: boolean;
}) {
  return (
    <div
      className={styles.root}
      inert={!isInteractive}
      data-share-card-preview={isInteractive ? undefined : ""}
    >
      {shouldLoad ? (
        <LazyStudioShareCard target={target} surface="post" />
      ) : (
        <StudioShareCardFrame surface="post">
          <StudioShareCardPlaceholder />
        </StudioShareCardFrame>
      )}
    </div>
  );
}
