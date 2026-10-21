import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Button } from "../../shared/components/ui";
import { ARTIST_SHOWCASE } from "./studioArtist.data";
import { formatStudioCount } from "./studioCount";
import styles from "./studio.module.css";
import { StudioEuroAmount } from "./StudioEuroAmount";

/** The money side of an artist page: demo only (`useStudioShowcase`).
 *  The page owns the column and adds the live Upcoming and Support cards
 *  after these. */
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
    <>
      <div className={styles.buyCard}>
        <div className={styles.eb}>
          {t("studio:artist.sidebar.sustainEyebrow", { artist: artistName })}
        </div>
        <div className={styles.price}>
          <em>
            <StudioEuroAmount value={ARTIST_SHOWCASE.subscribeAmount} />
          </em>
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
          <Button variant="quiet" className={styles.bt} onClick={onTip}>
            {t("studio:artist.sidebar.oneOffTipCta")}
          </Button>
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>
          {t("studio:artist.sidebar.thisMonthHeading", {
            artist: artistName,
          })}
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.newFollowers")}
          </span>
          <span className={styles.v}>
            {formatStudioCount(stats.newFollowers, t, formatters)}
          </span>
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
    </>
  );
}
