import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioRail } from "./StudioRail";
import { StudioPlayer } from "./StudioPlayer";
import { CURRENT_MEMBER_INITIALS, SUSTAIN_PRICE } from "./studioShell.data";
import styles from "./studio.module.css";

export function StudioShell({
  children,
  hidePlayer = false,
}: {
  children: ReactNode;
  hidePlayer?: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <StudioRail />

        <main className={styles.main}>
          <div className={styles.topbar}>
            <div className={styles.navs}>
              <button
                type="button"
                aria-label={t("studio:shell.back")}
                onClick={() => void navigate(-1)}
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                >
                  <path d="M9 1L3 7l6 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label={t("studio:shell.forward")}
                onClick={() => void navigate(1)}
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                >
                  <path d="M5 1l6 6-6 6" />
                </svg>
              </button>
            </div>
            <div className={styles.search}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <circle cx={11} cy={11} r={7} />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t("studio:shell.searchPlaceholder")}
              />
            </div>
            <div className={styles.topRight}>
              <Link to={routes.studioDashboard} className={styles.creatorLink}>
                {t("studio:shell.forArtistsCta")} →
              </Link>
              <Link to={routes.cinemaMembership} className={styles.sustainPill}>
                {t("studio:shell.sustainCta", {
                  price: fmt.currency(SUSTAIN_PRICE),
                })}
              </Link>
              <div className={styles.avatar}>{CURRENT_MEMBER_INITIALS}</div>
            </div>
          </div>

          <div className={styles.content}>{children}</div>
        </main>
      </div>

      {!hidePlayer && <StudioPlayer />}
    </div>
  );
}
