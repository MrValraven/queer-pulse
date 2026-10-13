import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ALBUM } from "./studioAlbum.data";
import { ARTIST_SHOWCASE } from "./studioArtist.data";
import styles from "./studio.module.css";

/** The money side of an artist page: demo only (`useStudioShowcase`). */
export function StudioArtistSidebar({
  artistName,
  onTip,
}: {
  artistName: string;
  onTip: () => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const stats = ARTIST_SHOWCASE.sidebarStats;
  return (
    <div className={styles.sideCol}>
      <div className={styles.buyCard}>
        <div className={styles.eb}>
          {t("studio:artist.sidebar.sustainEyebrow", { artist: artistName })}
        </div>
        <div className={styles.price}>
          €<em>{ARTIST_SHOWCASE.subscribeAmount}</em>
          <span className={styles.small}>
            {t("studio:artist.sidebar.perMonthSuffix")}
          </span>
        </div>
        <div className={styles.sub}>
          {t("studio:artist.sidebar.sustainSub", { artist: artistName })}
        </div>
        <div className={styles.buyActions}>
          <Link
            to={routes.studioCheckout}
            className={`${styles.bt} ${styles.btP}`}
          >
            {t("studio:artist.sidebar.subscribeCta", {
              amount: formatters.currency(ARTIST_SHOWCASE.subscribeAmount),
            })}
          </Link>
          <button type="button" className={styles.bt} onClick={onTip}>
            {t("studio:artist.sidebar.oneOffTipCta")}
          </button>
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>
          {t("studio:artist.sidebar.thisMonthHeading", {
            artist: artistName,
          })}
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>{t("studio:artist.sidebar.plays")}</span>
          <span className={styles.v}>{formatters.number(stats.plays)}</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.earningsStreaming")}
          </span>
          <span className={styles.v}>
            {formatters.currency(stats.earningsStreaming)}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.tipsReceived")}
          </span>
          <span className={styles.v}>
            {formatters.currency(stats.tipsReceived)}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.directSubscribers")}
          </span>
          <span className={styles.v}>
            {formatters.number(stats.directSubscribers)}
          </span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          {t("studio:detail.fullLedgerCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>

      <div className={styles.sideCard}>
        <div className={styles.eb}>
          {t("studio:artist.sidebar.upcomingHeading")}
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.premiereLabel")} · <em>{ALBUM.title}</em>
            <br />
            {ARTIST_SHOWCASE.premiereDateTime}
          </span>
          <Link to={routes.rsvp} className={styles.cta}>
            {t("studio:artist.sidebar.rsvpCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
