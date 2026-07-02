import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSaved } from "../../app/providers/SavedProvider";
import { FILM_SAVED, WATCH_TABS } from "./filmPage.data";
import { routes } from "../../app/routeMap";
import styles from "./FilmPage.module.css";

export function FilmHeroWatch() {
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const [tab, setTab] = useState(0);

  const onWatchlist = isSaved(FILM_SAVED.id);
  function toggleWatchlist() {
    const next = toggleSave(FILM_SAVED);
    showToast(
      next ? "Added to your watchlist" : "Removed from your watchlist",
      next ? "success" : "info",
    );
  }

  function copyLink() {
    void navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => showToast("Link copied", "success"))
      .catch(() => showToast("Could not copy link", "error"));
  }

  return (
    <div className={styles.watchBlock}>
      <div className={styles.wbTabs}>
        {WATCH_TABS.map((t, i) => (
          <div
            key={t.label}
            className={[styles.wbTab, tab === i && styles.wbTabActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(i)}
          >
            <span>{t.label}</span>
            <span className={styles.tw}>{t.sub}</span>
          </div>
        ))}
      </div>
      <div className={styles.wbActions}>
        <Button size="lg" to={routes.cinemaWatch}>
          ▶ &nbsp;Watch full film · 1h 32m
        </Button>
        <span
          role="button"
          tabIndex={0}
          className={[styles.iconBtn, onWatchlist && styles.iconBtnOn]
            .filter(Boolean)
            .join(" ")}
          title={onWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          aria-pressed={onWatchlist}
          aria-label={
            onWatchlist ? "Remove from watchlist" : "Add to watchlist"
          }
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
          title="Share"
          aria-label="Copy link to this film"
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
          When you rent at €3, <strong>€2.40 goes to Maria.</strong> €0.36
          covers payment processing. €0.24 covers hosting &amp; captions. The
          split is the same for every filmmaker.{" "}
          <Link to={routes.governance}>Read the deed →</Link>
        </div>
      </div>
    </div>
  );
}
