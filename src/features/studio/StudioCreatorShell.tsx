import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { Avatar } from "../../shared/components/ui";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioShellSignal } from "./useStudioShellSignal";
import { NAV } from "./StudioCreatorShell.data";
import s from "./creator.module.css";

/** Dark creator back-office frame: sticky topbar + sub-nav. `isEditingRelease`
 *  is set by the upload page while it reopens a published or taken-down
 *  release, so "New release" stops reading as the current page. */
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
  // A dark surface whatever the app theme: the subtree opts into the dark
  // token set so shared components paint their dark variants here.
  return (
    <div className={s.root} data-theme="dark">
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
                  {t(item.labelKey)}
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
          <span
            className={s.avatar}
            role="img"
            aria-label={t("studio:creator.avatarLabel", {
              name: persona?.name ?? identity.name,
            })}
          >
            <Avatar
              initials={persona?.initials ?? identity.initials}
              src={persona?.avatarUrl ?? identity.photo}
              size={34}
              alt=""
            />
          </span>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
