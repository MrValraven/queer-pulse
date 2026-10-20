import { ContentWarningPill } from "../forum/ForumContentWarning";
import type { StudioContentWarningId } from "./api/studioSafety.types";
import css from "./StudioSafety.module.css";

/** The forum's warning pill on a Studio row, the track page and the queue
 *  (spec 6.2): the same labels the forum composer and the player gate
 *  read. Nothing renders for a track without warnings. */
export function StudioTrackWarningPill({
  warnings,
  className,
}: {
  warnings: readonly StudioContentWarningId[] | undefined;
  className?: string;
}) {
  return (
    <ContentWarningPill
      warnings={warnings}
      className={[css.warningPill, className].filter(Boolean).join(" ")}
    />
  );
}
