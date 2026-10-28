import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { Button } from "../../shared/components/ui";
import { ALBUM_BUY, ALBUM_LEDGER } from "./studioAlbum.data";
import { formatStudioCount } from "./studioCount";
import styles from "./studio.module.css";
import sidebarStyles from "./StudioAlbumSidebar.module.css";
import { StudioEuroAmount } from "./StudioEuroAmount";

const ARTIST_SHARE = 6.4;
const SOLIDARITY_SHARE = 0.8;
const PLATFORM_SHARE = 0.8;

export function StudioAlbumSidebar({
  artistName,
  onTip,
}: {
  artistName: string;
  onTip: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <>
      <div className={styles.buyCard}>
        <div className={styles.eb}>{t("studio:album.sidebar.buyEyebrow")}</div>
        <div className={styles.price}>
          <em>
            <StudioEuroAmount value={ALBUM_BUY.price} />
          </em>
        </div>
        <div className={styles.sub}>{t("studio:album.sidebar.buySub")}</div>
        <div className={styles.buyActions}>
          <Link
            to={routes.studioCheckout}
            className={`${styles.bt} ${styles.btP} ${sidebarStyles.action} ${sidebarStyles.buy}`}
          >
            {t("studio:album.sidebar.buyCta", {
              amount: fmt.currency(ALBUM_BUY.price),
            })}
          </Link>
          <Button
            variant="quiet"
            className={`${styles.bt} ${sidebarStyles.action}`}
            onClick={onTip}
          >
            {t("studio:album.sidebar.payWhatYouCanCta", {
              amount: fmt.currency(ALBUM_BUY.payWhatYouCanMin),
            })}
          </Button>
          <Link
            to={routes.cinemaMembership}
            className={`${styles.bt} ${sidebarStyles.action}`}
          >
            {t("studio:album.sidebar.streamingIncludedCta")}
          </Link>
        </div>
        <div className={styles.splitHint}>
          <Translation
            i18nKey="studio:album.sidebar.splitHint"
            components={{ em: <em /> }}
            values={{
              price: fmt.currency(ALBUM_BUY.price),
              artist: artistName,
              artistShare: fmt.currency(ARTIST_SHARE),
              solidarityShare: fmt.currency(SOLIDARITY_SHARE),
              platformShare: fmt.currency(PLATFORM_SHARE),
            }}
          />
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>
          {/* One flex item, so the flex gap stays out of the sentence. */}
          <span>
            <Translation
              i18nKey="studio:album.sidebar.ledgerHeading"
              components={{ em: <em /> }}
            />
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:album.sidebar.paidToArtistLifetime", {
              artist: artistName,
            })}
          </span>
          <span className={styles.v}>
            {fmt.currency(ALBUM_LEDGER.paidToArtistLifetime)}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:album.sidebar.paidToCollaborators")}
          </span>
          <span className={styles.v}>
            {fmt.currency(ALBUM_LEDGER.paidToCollaborators)}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:album.sidebar.savesThisMonth")}
          </span>
          <span className={styles.v}>
            {formatStudioCount(ALBUM_LEDGER.savesThisMonth, t, fmt)}
          </span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          {t("studio:detail.fullLedgerCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </>
  );
}
