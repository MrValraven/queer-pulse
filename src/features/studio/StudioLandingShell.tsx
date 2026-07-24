import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { TOP_NAV, FOOTER_COLUMNS } from "./studioLanding.data";
import styles from "./StudioLandingPage.module.css";

/** Logged-out marketing chrome for the Studio landing: sticky topbar + footer. */
export function StudioLandingShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Link to={routes.homepage} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<span className={styles.q}>Pulse</span>
        </Link>
        <span className={styles.product}>{t("studio:brand.studioLabel")}</span>
        <nav className={styles.topNav}>
          {TOP_NAV.map((l) => (
            <Link key={l.label} to={l.to}>
              {t(l.labelKey)}
            </Link>
          ))}
        </nav>
        <div className={styles.topRight}>
          <Button variant="ghost-dark" to={routes.signIn}>
            {t("common:cta.signIn")}
          </Button>
        </div>
      </header>

      {children}

      <StudioLandingFooter />
    </div>
  );
}

function StudioLandingFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.foot}>
      <div className={styles.footInner}>
        <div className={styles.footBrand}>
          <Link to={routes.homepage} className={styles.brand}>
            <span className={styles.pulseDot} aria-hidden />
            Queer<span className={styles.q}>Pulse</span>
          </Link>
          <p>{t("studio:landing.footer.tagline")}</p>
        </div>
        <div className={styles.footCols}>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className={styles.footCol}>
              <h4>{t(col.titleKey)}</h4>
              {col.links.map((l) => (
                <Link key={l.label} to={l.to}>
                  {t(l.labelKey)}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.footBase}>
        <span>
          {t("studio:landing.footer.copyright", { year: currentYear })}
        </span>
        <span>{t("studio:landing.footer.languages")}</span>
      </div>
    </footer>
  );
}
