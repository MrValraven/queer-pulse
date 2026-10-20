import { useState } from "react";
import { FiFlag } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioTrackReportDialog } from "./StudioTrackReportDialog";
import { StudioTrackWarningPill } from "./StudioTrackWarningPill";
import { useIsOwnStudioPersona } from "./useIsOwnStudioPersona";
import css from "./StudioClaimPanel.module.css";

/** Whether the hero's track menu already carries "Report track": the track
 *  hero always mounts the menu, the episode hero only for a playable
 *  episode (StudioEpisodeHero `isPlayable`). */
function isReportInHeroMenu(track: StudioTrackView) {
  if (!track.release.isShow) return true;
  return track.hasAudio && track.isDraft !== true;
}

/** Under the track page's hero, beside the details column: the track's
 *  warning pill (spec 6.2), and "Report track" (spec 8) only where the
 *  hero's menu does not offer it, so the page never offers it twice. It
 *  waits for Studio access to load and folds in, so an owner never sees it
 *  flash and nobody sees it pop in. */
export function StudioTrackSafetyRow({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const [isReporting, setIsReporting] = useState(false);
  const { isPending: isAccessPending } = useStudioAccess();
  const isOwn = useIsOwnStudioPersona(track.release.artist.id);
  const isReportable =
    !isAccessPending &&
    !isOwn &&
    track.release.publishedAt !== null &&
    track.isWithheld !== true &&
    !isReportInHeroMenu(track);
  return (
    <div className={css.safetyRow}>
      <StudioTrackWarningPill warnings={track.contentWarnings} />
      <Collapse isOpen={isReportable}>
        <Button variant="ghost" size="sm" onClick={() => setIsReporting(true)}>
          <FiFlag aria-hidden /> {t("studio:report.trackCta")}
        </Button>
      </Collapse>
      <StudioTrackReportDialog
        isOpen={isReporting}
        trackId={track.id}
        trackTitle={track.title}
        onClose={() => setIsReporting(false)}
      />
    </div>
  );
}
