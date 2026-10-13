import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { StudioAccountMenu } from "./StudioAccountMenu";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioShellSignal } from "./useStudioShellSignal";
import { NAV } from "./StudioCreatorShell.data";
import s from "./creator.module.css";
import shellStyles from "./StudioShell.module.css";

/** Creator back-office frame: sticky topbar + sub-nav, following the app
 *  theme like the listener shell. `isEditingRelease` is set by the upload
 *  page while it reopens a published or taken-down release, so "New
 *  release" stops reading as the current page. */
export function StudioCreatorShell({
  children,
  persona,
  isEditingRelease = false,
}: {
  children: ReactNode;
  persona?: StudioArtistRefView | null;
  isEditingRelease?: boolean;
}) {
  const { t } = useTranslation();
  const identity = useAccountIdentity();
  const isShowcase = useStudioShowcase();
  useStudioShellSignal();
  // Studio follows the app theme: its colours come from the theme-following
  // --studio-* tokens, so the shell and the shared components inside it
  // switch with the rest of the app.
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
          {NAV.filter((item) => isShowcase || !item.isShowcaseOnly).map(
            (item) => {
              const isSuppressed =
                isEditingRelease && item.to === routes.studioUpload;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={isSuppressed ? "false" : "page"}
                  className={({ isActive }) =>
                    [s.navItem, isActive && !isSuppressed && s.navItemActive]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  {t(
                    isShowcase
                      ? item.labelKey
                      : (item.liveLabelKey ?? item.labelKey),
                  )}
                </NavLink>
              );
            },
          )}
        </nav>
        <div className={s.topRight}>
          {(persona || isShowcase) && (
            <Link
              to={persona ? persona.href : routes.studioArtist}
              className={s.back}
            >
              {t("studio:creator.viewPublicPageCta")}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          )}
          <StudioAccountMenu
            className={shellStyles.creatorAccount}
            persona={persona}
            triggerLabel={t("studio:creator.avatarLabel", {
              name: persona?.name ?? identity.name,
            })}
          />
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
