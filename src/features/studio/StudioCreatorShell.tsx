import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NAV } from "./StudioCreatorShell.data";
import s from "./creator.module.css";

// Mock signed-in artist's avatar initials — content, not chrome.
const AVATAR_INITIALS = "MS";

/** Dark creator back-office frame: sticky topbar + sub-nav. */
export function StudioCreatorShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className={s.root}>
      <div className={s.topbar}>
        <Link to={routes.studio} className={s.brand}>
          <span className={s.pulseDot} aria-hidden />
          <Translation
            i18nKey="studio:brand.lockup"
            components={{ em: <em /> }}
          />
        </Link>
        <span className={s.product}>{t("studio:creator.product")}</span>
        <nav className={s.subnav}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [s.navItem, isActive && s.navItemActive]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className={s.topRight}>
          <Link to={routes.studioArtist} className={s.back}>
            {t("studio:creator.viewPublicPageCta")} <FiArrowRight aria-hidden />
          </Link>
          <div className={s.avatar}>{AVATAR_INITIALS}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
