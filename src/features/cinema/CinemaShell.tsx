import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useScrolled } from "../../shared/hooks/useScrolled";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CinemaShell.module.css";
import { routes } from "../../app/routeMap";

/** i18n Pattern A — nav labels are catalog keys, sole consumer below. */
const LINKS = [
  { labelKey: "cinema:nav.thisWeek", to: routes.cinema },
  { labelKey: "cinema:nav.browse", to: routes.cinemaBrowse },
  { labelKey: "cinema:nav.collections", to: routes.cinemaCollections },
  { labelKey: "cinema:nav.madeHere", to: routes.cinemaShorts },
  { labelKey: "cinema:nav.openCalls", to: routes.cinemaOpenCalls },
  { labelKey: "cinema:nav.about", to: routes.cinemaAbout },
  { labelKey: "cinema:nav.membership", to: routes.cinemaMembership },
];

/** Dark co-op cinema frame: floating dark nav + cinema footer. */
export function CinemaShell({ children }: { children: ReactNode }) {
  const scrolled = useScrolled(8);
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div className={styles.root}>
      <nav
        className={[styles.nav, scrolled && styles.scrolled]
          .filter(Boolean)
          .join(" ")}
      >
        <Link to={routes.cinema} className={styles.brand}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<em>Pulse</em>
          <span className={styles.brandTag}>{t("cinema:brand.tag")}</span>
        </Link>
        <div className={styles.links}>
          {LINKS.map((item) => (
            <NavLink
              key={item.to}
              end={item.to === routes.cinema}
              to={item.to}
              className={({ isActive }) =>
                [styles.link, isActive && styles.linkActive]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </div>
        <div className={styles.right}>
          <Button variant="ghost-dark" to={routes.cinemaSubmit}>
            {t("cinema:nav.submitCta")}
          </Button>
          <Button to={routes.cinemaMembership}>
            {t("cinema:nav.sustainCta", { price: fmt.currency(7) })}
          </Button>
        </div>
      </nav>

      <main>{children}</main>

      <footer className={styles.footer}>
        <div className="wrap">
          <div className={styles.footGrid}>
            <div className={styles.footBrand}>
              <Link to={routes.homepage} className={styles.brand}>
                <span className={styles.pulseDot} aria-hidden />
                Queer<em>Pulse</em>
              </Link>
              <p>{t("cinema:footer.tagline")}</p>
            </div>
            <div className={styles.footCols}>
              <div className={styles.footCol}>
                <h4>{t("cinema:footer.cinema.heading")}</h4>
                <Link to={routes.cinema}>
                  {t("cinema:footer.cinema.thisWeek")}
                </Link>
                <Link to={routes.cinemaBrowse}>
                  {t("cinema:footer.cinema.browseAll")}
                </Link>
                <Link to={routes.cinemaBrowse}>
                  {t("cinema:footer.cinema.collections")}
                </Link>
                <Link to={routes.cinemaMembership}>
                  {t("cinema:footer.cinema.membership")}
                </Link>
              </div>
              <div className={styles.footCol}>
                <h4>{t("cinema:footer.filmmakers.heading")}</h4>
                <Link to={routes.cinemaSubmit}>
                  {t("cinema:footer.filmmakers.submit")}
                </Link>
                <Link to={routes.cinemaMembership}>
                  {t("cinema:footer.filmmakers.revenueSplit")}
                </Link>
                <Link to={routes.cinemaRights}>
                  {t("cinema:footer.filmmakers.rights")}
                </Link>
              </div>
              <div className={styles.footCol}>
                <h4>{t("cinema:footer.about.heading")}</h4>
                <Link to={routes.governance}>
                  {t("cinema:footer.about.publicLedger")}
                </Link>
                <Link to={routes.homepage}>
                  {t("cinema:footer.about.queerpulse")}
                </Link>
              </div>
            </div>
          </div>
          <div className={styles.footBase}>
            <div>
              {t("cinema:footer.copyright", { year: new Date().getFullYear() })}
            </div>
            <div>{t("cinema:footer.split")}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
