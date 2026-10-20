import { useId, type ReactNode } from "react";
import { Collapse } from "../../shared/components/ui";
import { ContentWarningReveal } from "../forum/ForumContentWarning";
import { useContentWarningReveal } from "../forum/forumWarnings.helpers";
import type { StudioContentWarningId } from "./api/studioSafety.types";
import css from "./StudioWarnedContent.module.css";

/** A warned track's lyrics or show notes stay covered behind the forum's
 *  "Show it anyway: {themes}" until the member presses it (spec 6.2). The
 *  reveal holds for the life of this tab, as on the forum. */
export function StudioWarnedContent({
  trackId,
  warnings,
  children,
}: {
  trackId: string;
  warnings: readonly StudioContentWarningId[] | undefined;
  children: ReactNode;
}) {
  const contentId = useId();
  const { isRevealed, reveal, cover } = useContentWarningReveal(
    `studio-track:${trackId}`,
  );
  const isWarned = (warnings?.length ?? 0) > 0;
  return (
    <>
      <ContentWarningReveal
        warnings={warnings}
        isRevealed={isRevealed}
        onToggle={isRevealed ? cover : reveal}
        controlsId={contentId}
        className={css.reveal}
      />
      <div id={contentId}>
        <Collapse isOpen={!isWarned || isRevealed}>{children}</Collapse>
      </div>
    </>
  );
}
