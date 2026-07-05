import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { StudioRail } from "./StudioRail";
import { StudioPlayer } from "./StudioPlayer";
import styles from "./studio.module.css";

export function StudioShell({
  children,
  hidePlayer = false,
}: {
  children: ReactNode;
  hidePlayer?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <StudioRail />

        <main className={styles.main}>
          <div className={styles.topbar}>
            <div className={styles.navs}>
              <button
                type="button"
                aria-label="Back"
                onClick={() => navigate(-1)}
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
                aria-label="Forward"
                onClick={() => navigate(1)}
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
                placeholder="search artists, tracks, sheet music…"
              />
            </div>
            <div className={styles.topRight}>
              <Link to={routes.studioDashboard} className={styles.creatorLink}>
                For artists →
              </Link>
              <Link to={routes.cinemaMembership} className={styles.sustainPill}>
                Sustain · €7/mo
              </Link>
              <div className={styles.avatar}>RM</div>
            </div>
          </div>

          <div className={styles.content}>{children}</div>
        </main>
      </div>

      {!hidePlayer && <StudioPlayer />}
    </div>
  );
}
