import { useEffect, useRef, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import {
  MAIN_CONTENT_ID,
  SkipToContentLink,
} from "../../shared/components/layout/SkipToContentLink";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { StudioAccountMenu } from "./StudioAccountMenu";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioShellSignal } from "./useStudioShellSignal";
import { NAV } from "./StudioCreatorShell.data";
import { StudioCreditsBadge } from "./StudioCreditsBadge";
import { StudioSalesPendingBadge } from "./StudioSalesPendingBadge";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import s from "./creator.module.css";
import layoutStyles from "./StudioCreatorShell.module.css";
import shellStyles from "./StudioShell.module.css";

/** Creator back-office frame: sticky topbar + sub-nav, following the app
 *  theme like the listener shell. `isEditingRelease` is set by the upload
 *  page while it reopens a published or taken-down release, so "New
 *  release" stops reading as the current page. The topbar sits outside
 *  `<main id="main-content">`, so the skip link and the focus RouteAnnouncer
 *  moves after each navigation land on the page. Tablets and phones get a
 *  two-row bar (StudioCreatorShell.module.css). */
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
  // Phones keep the bar two rows tall: the public page link moves into
  // the avatar menu there (matches `--md`).
  const isPhone = useMediaQuery(mediaMax(640));
  const publicPageHref =
    persona || isShowcase ? (persona?.href ?? routes.studioArtist) : undefined;
  useStudioShellSignal();
  useStudioDocumentTitle();
  const { pathname } = useLocation();
  const { reducedMotion } = useMotionPrefs();
  const navRef = useRef<HTMLElement>(null);
  // On a phone the tabs scroll sideways: the current one is brought into
  // view on each page, along the row only ("nearest" keeps the page still).
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({
        inline: "nearest",
        block: "nearest",
        behavior: reducedMotion ? "instant" : "smooth",
      });
  }, [pathname, reducedMotion]);
  // Studio follows the app theme: its colours come from the theme-following
  // --studio-* tokens, so the shell and the shared components inside it
  // switch with the rest of the app.
  return (
    <div className={s.root}>
      <SkipToContentLink />
      <header className={`${s.topbar} ${layoutStyles.topbar}`}>
        <Link to={routes.studio} className={s.brand}>
          <span className={s.pulseDot} aria-hidden />
          {/* One span keeps the wordmark a single flex item, so the brand's
              gap spaces the dot and never splits "Queer" from "Pulse". */}
          <span>
            <Translation
              i18nKey="studio:brand.lockup"
              components={{ em: <em /> }}
            />
          </span>
        </Link>
        <span className={s.product}>{t("studio:creator.product")}</span>
        <nav
          ref={navRef}
          className={`${s.subnav} ${layoutStyles.subnav}`}
          aria-label={t("studio:creator.navLabel")}
        >
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
                  {item.badge === "creditRequests" && <StudioCreditsBadge />}
                  {item.badge === "salesPending" && <StudioSalesPendingBadge />}
                </NavLink>
              );
            },
          )}
        </nav>
        <div className={s.topRight}>
          {publicPageHref && !isPhone && (
            <Link to={publicPageHref} className={s.back}>
              {t("studio:creator.viewPublicPageCta")}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          )}
          <StudioAccountMenu
            className={shellStyles.creatorAccount}
            persona={persona}
            publicPageHref={isPhone ? publicPageHref : undefined}
            triggerLabel={t("studio:creator.avatarLabel", {
              name: persona?.name ?? identity.name,
            })}
          />
        </div>
      </header>
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={layoutStyles.main}>
        {children}
      </main>
    </div>
  );
}
