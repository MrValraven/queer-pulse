import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioTrackView } from "./api/studio.adapters";
import { useStudioShowcase } from "./useStudioShowcase";
import trackStyles from "./track.module.css";

export function StudioTrackLyrics({ track }: { track: StudioTrackView }) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  return (
    <div className={trackStyles.lyrCard}>
      <div className={trackStyles.lyrH}>
        <h3>{t("studio:trackPage.lyricsHeading")}</h3>
      </div>
      {track.lyricStanzas.length > 0 ? (
        <div className={trackStyles.lyric} lang="und">
          {track.lyricStanzas.map((lines, stanzaIndex) => (
            <p key={stanzaIndex} className={trackStyles.stanza}>
              {lines.map((line, lineIndex) => (
                <Fragment key={lineIndex}>
                  {line}
                  {lineIndex < lines.length - 1 && <br />}
                </Fragment>
              ))}
            </p>
          ))}
        </div>
      ) : (
        <p className={trackStyles.noLyrics}>{t("studio:trackPage.noLyrics")}</p>
      )}
      {isShowcase && (
        <div className={trackStyles.lyrFoot}>
          <Link to={routes.studioSheetStore}>
            {t("studio:track.lyrics.leadSheetChordsCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
