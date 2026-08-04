import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./studio.module.css";

const ARTIST_NAME = "Mariana Sol";
const SUBSCRIBE_AMOUNT = 3;
const SIDEBAR_STATS = {
  plays: 36400,
  earningsStreaming: 1820,
  tipsReceived: 448,
  directSubscribers: 612,
};

export function StudioArtistSidebar({ onTip }: { onTip: () => void }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.sideCol}>
      <div className={styles.buyCard}>
        <div className={styles.eb}>
          {t("studio:artist.sidebar.sustainEyebrow", { artist: ARTIST_NAME })}
        </div>
        <div className={styles.price}>
          €<em>{SUBSCRIBE_AMOUNT}</em>
          <span style={{ fontSize: 14, color: "var(--text40)" }}>/month</span>
        </div>
        <div className={styles.sub}>
          {t("studio:artist.sidebar.sustainSub", { artist: ARTIST_NAME })}
        </div>
        <div className={styles.buyActions}>
          <Link
            to={routes.studioCheckout}
            className={`${styles.bt} ${styles.btP}`}
          >
            {t("studio:artist.sidebar.subscribeCta", {
              amount: fmt.currency(SUBSCRIBE_AMOUNT),
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
            artist: ARTIST_NAME,
          })}
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>{t("studio:artist.sidebar.plays")}</span>
          <span className={styles.v}>{fmt.number(SIDEBAR_STATS.plays)}</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.earningsStreaming")}
          </span>
          <span className={styles.v}>
            {fmt.currency(SIDEBAR_STATS.earningsStreaming)}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.tipsReceived")}
          </span>
          <span className={styles.v}>
            {fmt.currency(SIDEBAR_STATS.tipsReceived)}
          </span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.directSubscribers")}
          </span>
          <span className={styles.v}>
            {fmt.currency(SIDEBAR_STATS.directSubscribers)}
          </span>
        </div>
        <Link to={routes.governance} className={styles.cta}>
          {t("studio:detail.fullLedgerCta")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>

      <div className={styles.sideCard}>
        <div className={styles.eb}>
          {t("studio:artist.sidebar.upcomingHeading")}
        </div>
        <div className={styles.lrow} style={{ marginTop: 10 }}>
          <span className={styles.k}>
            {t("studio:artist.sidebar.premiereLabel")} ·{" "}
            <em style={{ color: "var(--text)", fontStyle: "italic" }}>
              Cidade dos santos
            </em>
            <br />
            10 Jun · 21:00 Lisbon
          </span>
          <Link
            to={routes.rsvp}
            className={styles.cta}
            style={{ marginTop: 0 }}
          >
            {t("studio:artist.sidebar.rsvpCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
