import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioShell } from "./StudioShell";
import { StudioTrackHero } from "./StudioTrackHero";
import { StudioTrackLyrics } from "./StudioTrackLyrics";
import { StudioTrackSidebar } from "./StudioTrackSidebar";
import { StudioTipModal } from "./StudioTipModal";
import { MORE } from "./studioTrack.data";
import ss from "./studio.module.css";
import trackStyles from "./track.module.css";

// Content — this track's title, artist name and album title come from the
// API in live mode and are never translated (§1).
const ARTIST_NAME = "Mariana Sol";
const ALBUM_TITLE = "Cidade dos santos";
const TRACK_NUMBER = 6;

export function StudioTrackPage() {
  const { t } = useTranslation();
  const [tipOpen, setTipOpen] = useState(false);

  return (
    <StudioShell>
      <div className={trackStyles.crumb}>
        <Link to={routes.studioArtist}>{ARTIST_NAME}</Link>
        <span>›</span>
        <Link to={routes.studioAlbum}>{ALBUM_TITLE}</Link>
        <span>›</span>
        <em>{t("studio:track.page.crumbLabel", { number: TRACK_NUMBER })}</em>
      </div>

      <StudioTrackHero onTip={() => setTipOpen(true)} />

      <div className={trackStyles.inSet}>
        <span className={trackStyles.live} />
        <span>
          <Translation
            i18nKey="studio:track.inSet.status"
            components={{ b: <b />, em: <em /> }}
            values={{
              count: 312,
              curator: "Sara Marques",
              next: 7,
              countdown: "2:36",
            }}
          />
        </span>
        <Link to={routes.studioLive}>
          {t("studio:track.inSet.joinCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>

      <div className={trackStyles.body}>
        <StudioTrackLyrics />
        <StudioTrackSidebar />
      </div>

      <section className={ss.row}>
        <div className={ss.rowH}>
          <h2>
            <Translation
              i18nKey="studio:album.more.heading"
              values={{ artist: ALBUM_TITLE }}
              components={{ em: <em /> }}
            />
          </h2>
          <Link to={routes.studioAlbum} className={ss.all}>
            {t("studio:track.more.fullAlbumCta")} <FiArrowRight aria-hidden />
          </Link>
        </div>
        <div className={ss.rowGrid}>
          {MORE.map((mr) => (
            <Link key={mr.pre} to={routes.studioTrack} className={ss.card}>
              <div className={ss.cardCov}>
                <ImageSlot
                  src={mr.image}
                  tint={mr.tint}
                  width="100%"
                  height="100%"
                  radius={10}
                  placeholder={t("studio:media.coverLabel")}
                  style={{ position: "absolute", inset: 0 }}
                />
              </div>
              <h4>
                {mr.pre}
                {mr.em && <em>{mr.em}</em>}
                {mr.post}
              </h4>
              <div className={ss.meta}>{mr.meta}</div>
            </Link>
          ))}
        </div>
      </section>

      {tipOpen && (
        <StudioTipModal
          recipient="Mariana Sol"
          onClose={() => setTipOpen(false)}
        />
      )}
    </StudioShell>
  );
}
