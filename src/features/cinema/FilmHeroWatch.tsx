import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiPlay } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSaved } from "../../app/providers/useSaved";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FILM_SAVED, WATCH_TABS } from "./filmPage.data";
import { routes } from "../../app/routeMap";
import styles from "./FilmPage.module.css";

export function FilmHeroWatch() {
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const { t } = useTranslation();
  const fmt = useFormat();
  const [tab, setTab] = useState(0);

  const onWatchlist = isSaved(FILM_SAVED.id);
  function toggleWatchlist() {
    const next = toggleSave(FILM_SAVED);
    showToast(
      next
        ? t("cinema:film.watchlist.addedToast")
        : t("cinema:film.watchlist.removedToast"),
      next ? "success" : "info",
    );
  }

  function copyLink() {
    void navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => showToast(t("cinema:film.share.copiedToast"), "success"))
      .catch(() => showToast(t("cinema:film.share.copyErrorToast"), "error"));
  }

  return (
    <div className={styles.watchBlock}>
      <div className={styles.wbTabs}>
        {WATCH_TABS.map((tabInfo, index) => (
          <button
            type="button"
            key={tabInfo.labelKey}
            className={[styles.wbTab, tab === index && styles.wbTabActive]
              .filter(Boolean)
              .join(" ")}
            aria-current={tab === index}
            onClick={() => setTab(index)}
          >
            <span>
              {t(
                tabInfo.labelKey,
                tabInfo.price != null
                  ? { price: fmt.currency(tabInfo.price) }
                  : undefined,
              )}
            </span>
            <span className={styles.tw}>
              {t(
                tabInfo.subKey,
                tabInfo.hours != null ? { hours: tabInfo.hours } : undefined,
              )}
            </span>
          </button>
        ))}
      </div>
      <div className={styles.wbActions}>
        <Button size="lg" to={routes.cinemaWatch}>
          <FiPlay aria-hidden />{" "}
          {t("cinema:film.watch.mainCta", { duration: "1h 32m" })}
        </Button>
        <span
          role="button"
          tabIndex={0}
          className={[styles.iconBtn, onWatchlist && styles.iconBtnOn]
            .filter(Boolean)
            .join(" ")}
          title={t(
            onWatchlist
              ? "cinema:film.watchlist.remove"
              : "cinema:film.watchlist.add",
          )}
          aria-pressed={onWatchlist}
          aria-label={t(
            onWatchlist
              ? "cinema:film.watchlist.remove"
              : "cinema:film.watchlist.add",
          )}
          onClick={toggleWatchlist}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleWatchlist();
            }
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={onWatchlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span
          role="button"
          tabIndex={0}
          className={styles.iconBtn}
          title={t("cinema:film.share.title")}
          aria-label={t("cinema:film.share.ariaLabel")}
          onClick={copyLink}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              copyLink();
            }
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx={18} cy={5} r={3} />
            <circle cx={6} cy={12} r={3} />
            <circle cx={18} cy={19} r={3} />
            <line x1={8.59} y1={13.51} x2={15.42} y2={17.49} />
            <line x1={15.41} y1={6.51} x2={8.59} y2={10.49} />
          </svg>
        </span>
      </div>
      <div className={styles.wbSplit}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx={12} cy={12} r={10} />
          <path d="M12 6v6l4 2" />
        </svg>
        <div>
          <Translation
            i18nKey="cinema:film.split.explainer"
            components={{ strong: <strong /> }}
            values={{
              rentPrice: fmt.currency(3),
              filmmakerShare: fmt.currency(2.4),
              paymentFee: fmt.currency(0.36),
              hostingFee: fmt.currency(0.24),
              name: "Maria",
            }}
          />{" "}
          <Link to={routes.governance}>
            {t("cinema:film.split.readDeedCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
