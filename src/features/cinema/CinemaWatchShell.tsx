import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiFilm } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./WatchPage.module.css";
import { routes } from "../../app/routeMap";

/** Dark watch-page chrome (brand + back links) shared by the live player and
 *  its gating notices. */
export function WatchShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <Link to={routes.cinemaBrowse} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <em style={{ fontStyle: "italic" }} /> }}
          />
        </Link>
        <div className={styles.navLinks}>
          <Link to={routes.cinemaBrowse}>
            <FiArrowLeft aria-hidden /> {t("cinema:watch.nav.backToFilm")}
          </Link>
          <Link to={routes.cinema}>{t("cinema:watch.nav.cinemaHome")}</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}

/** A centered notice (sign-in / pick / not-found) inside the watch shell. */
export function WatchNotice({
  titleKey,
  descKey,
  ctaKey,
  to,
}: {
  titleKey: string;
  descKey: string;
  ctaKey?: string;
  to?: string;
}) {
  const { t } = useTranslation();
  return (
    <WatchShell>
      <EmptyState
        icon={<FiFilm />}
        title={t(titleKey)}
        description={t(descKey)}
        action={ctaKey && to ? { label: t(ctaKey), to } : undefined}
      />
    </WatchShell>
  );
}
