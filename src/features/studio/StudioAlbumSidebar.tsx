import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { ALBUM_BUY, ALBUM_LEDGER } from "./studioAlbum.data";
import styles from "./studio.module.css";

const ARTIST_NAME = "Mariana Sol";
const ARTIST_SHARE = 6.4;
const SOLIDARITY_SHARE = 0.8;
const PLATFORM_SHARE = 0.8;

export function StudioAlbumSidebar({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.sideCol}>
      <div className={styles.buyCard}>
        <div className={styles.eb}>{t("studio:album.sidebar.buyEyebrow")}</div>
        <div className={styles.price}>
          €<em>{ALBUM_BUY.price}</em>
        </div>
        <div className={styles.sub}>{t("studio:album.sidebar.buySub")}</div>
        <div className={styles.buyActions}>
          <Link
            to={routes.studioCheckout}
            className={`${styles.bt} ${styles.btP}`}
          >
            {t("studio:album.sidebar.buyCta", {
              amount: fmt.currency(ALBUM_BUY.price),
            })}
          </Link>
          <button type="button" className={styles.bt} onClick={onTip}>
            {t("studio:album.sidebar.payWhatYouCanCta", {
              amount: fmt.currency(ALBUM_BUY.payWhatYouCanMin),
            })}
          </button>
          <Link to={routes.cinemaMembership} className={styles.bt}>
            {t("studio:album.sidebar.streamingIncludedCta")}
          </Link>
        </div>
        <div className={styles.splitHint}>
          <Translation
            i18nKey="studio:album.sidebar.splitHint"
            components={{ em: <em /> }}
            values={{
              price: fmt.currency(ALBUM_BUY.price),
              artist: ARTIST_NAME,
              artistShare: fmt.currency(ARTIST_SHARE),
              solidarityShare: fmt.currency(SOLIDARITY_SHARE),
              platformShare: fmt.currency(PLATFORM_SHARE),
            }}
          />
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>
          <Translation
            i18nKey="studio:album.sidebar.ledgerHeading"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:album.sidebar.paidToArtistLifetime", {
              artist: ARTIST_NAME,
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
            {t("studio:album.sidebar.playsThisMonth")}
          </span>
          <span className={styles.v}>
            {fmt.number(ALBUM_LEDGER.playsThisMonth)}
          </span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          {t("studio:detail.fullLedgerCta")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
