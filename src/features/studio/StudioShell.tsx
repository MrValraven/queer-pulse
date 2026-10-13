import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioRail } from "./StudioRail";
import { StudioShellAccount } from "./StudioShellAccount";
import { StudioShellSearch } from "./StudioShellSearch";
import { useStudioAccess } from "./api/useStudioAccess";
import { SUSTAIN_PRICE } from "./studioShell.data";
import { studioUploadPath } from "./studioPaths";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioShellSignal } from "./useStudioShellSignal";
import styles from "./studio.module.css";

export function StudioShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fmt = useFormat();
  const isShowcase = useStudioShowcase();
  const { uploadablePersonas } = useStudioAccess();
  useStudioShellSignal();
  // Studio is a dark surface whatever the app theme: the subtree opts into the
  // dark token set so shared components (buttons, avatars, empty states,
  // selects) paint their dark variants here.
  return (
    <div className={styles.root} data-theme="dark">
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
            <StudioShellSearch />
            <div className={styles.topRight}>
              {isShowcase ? (
                <>
                  <Link
                    to={routes.studioDashboard}
                    className={styles.creatorLink}
                  >
                    {t("studio:shell.forArtistsCta")}{" "}
                    <FiArrowRight aria-hidden />
                  </Link>
                  <Link
                    to={routes.cinemaMembership}
                    className={styles.sustainPill}
                  >
                    {t("studio:shell.sustainCta", {
                      price: fmt.currency(SUSTAIN_PRICE),
                    })}
                  </Link>
                </>
              ) : (
                uploadablePersonas.length > 0 && (
                  <Link to={studioUploadPath()} className={styles.creatorLink}>
                    {t("studio:shell.uploadCta")} <FiArrowRight aria-hidden />
                  </Link>
                )
              )}
              <StudioShellAccount />
            </div>
          </div>

          <div className={styles.content}>{children}</div>
        </main>
      </div>
    </div>
  );
}
