import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiUpload } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { StudioRail } from "./StudioRail";
import { StudioAccountMenu } from "./StudioAccountMenu";
import { StudioShellSearch } from "./StudioShellSearch";
import { StudioTabBar } from "./StudioTabBar";
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
  const identity = useAccountIdentity();
  const isCompact = useMediaQuery(mediaMax(880));
  useStudioShellSignal();
  // Phones get the short action labels so the brand fits whole beside them;
  // the full wording stays the link's accessible name.
  const sustainLabel = t("studio:shell.sustainCta", {
    price: fmt.currency(SUSTAIN_PRICE),
  });
  // One menu, placed by width: on phones and tablets the avatar leads the
  // single-row topbar and opens a side sheet; wider, it ends the actions.
  const accountMenu = (
    <StudioAccountMenu
      triggerLabel={t("studio:shell.accountLabel", { name: identity.name })}
      isSheetOnCompact
    />
  );
  // Studio follows the app theme: its colours come from the theme-following
  // --studio-* tokens, so the shell and the shared components inside it
  // (buttons, avatars, empty states, selects) switch with the rest of the app.
  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <StudioRail />

        <main className={styles.main}>
          <div className={styles.topbar}>
            {isCompact && accountMenu}
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
            {/* Search is a tab on phones and /studio/search has its own
                field, so the bar shows the brand there. */}
            {isCompact ? (
              <Link to={routes.studio} className={styles.topBrand}>
                <span className={styles.pulseDot} aria-hidden />
                <span className={styles.topBrandWord}>
                  <Translation
                    i18nKey="studio:brand.lockup"
                    components={{ em: <em /> }}
                  />
                </span>
                <span className={styles.visuallyHidden}>
                  {` ${t("studio:brand.studioLabel")}`}
                </span>
              </Link>
            ) : (
              <StudioShellSearch />
            )}
            <div className={styles.topRight}>
              {isShowcase ? (
                <>
                  {/* On phones the sheet's Artist dashboard row covers it. */}
                  {!isCompact && (
                    <Link
                      to={routes.studioDashboard}
                      className={styles.creatorLink}
                    >
                      {t("studio:shell.forArtistsCta")}{" "}
                      <FiArrowRight aria-hidden />
                    </Link>
                  )}
                  <Link
                    to={routes.cinemaMembership}
                    className={styles.sustainPill}
                    aria-label={isCompact ? sustainLabel : undefined}
                  >
                    {isCompact ? t("studio:shell.sustainShort") : sustainLabel}
                  </Link>
                </>
              ) : (
                uploadablePersonas.length > 0 && (
                  <Link
                    to={studioUploadPath()}
                    className={styles.creatorLink}
                    aria-label={
                      isCompact ? t("studio:shell.uploadCta") : undefined
                    }
                  >
                    {isCompact ? (
                      <>
                        <FiUpload aria-hidden /> {t("studio:shell.uploadShort")}
                      </>
                    ) : (
                      <>
                        {t("studio:shell.uploadCta")}{" "}
                        <FiArrowRight aria-hidden />
                      </>
                    )}
                  </Link>
                )
              )}
              {!isCompact && accountMenu}
            </div>
          </div>

          <div className={styles.content}>{children}</div>
          <StudioTabBar />
        </main>
      </div>
    </div>
  );
}
