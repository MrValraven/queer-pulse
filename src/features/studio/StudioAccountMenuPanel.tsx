import { Link } from "react-router-dom";
import { FiArrowLeft, FiUser, FiLogOut } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioMenuShouldReplace } from "./studioAccountMenuNavigation";
import { requestStudioSignOut } from "./useStudioSignOutAfterLeave";
import { useStudioShowcase } from "./useStudioShowcase";
import {
  STUDIO_MENU_CONTRIBUTE_ITEMS,
  STUDIO_MENU_COOP_ITEMS,
  STUDIO_MENU_CREATOR_ITEMS,
  STUDIO_MENU_HELP_ITEMS_LIVE,
  STUDIO_MENU_HELP_ITEMS_SHOWCASE,
  STUDIO_MENU_LISTEN_ITEMS_SHOWCASE,
  STUDIO_MENU_STAFF_ITEMS,
  STUDIO_MENU_STUDIO_ITEMS,
} from "./studioAccountMenu.data";
import {
  StudioAccountMenuArtistPages,
  StudioAccountMenuHelp,
} from "./StudioAccountMenuDisclosures";
import { StudioAccountMenuGroup } from "./StudioAccountMenuGroups";
import { StudioAccountMenuHeader } from "./StudioAccountMenuHeader";
import { StudioThemeRow } from "./StudioAccountMenuRows";
import { useStudioMenuItemFilter } from "./useStudioMenuItemFilter";
import styles from "./StudioAccountMenu.module.css";

/** The open panel of {@link StudioAccountMenu}: the member's header, the
 *  creator pages, their artist pages, the showcase's contribute and co-op
 *  pages, staff tools, the Studio pages with Help and info, the theme
 *  switch, and the exits back to QueerPulse and out of the session. The
 *  phone side sheet (StudioNavSheet) reuses it full height through
 *  `className` and `isSheet`. */
export function StudioAccountMenuPanel({
  id,
  isExiting,
  persona,
  onNavigate,
  className,
  isSheet = false,
  publicPageHref,
}: {
  id: string;
  isExiting: boolean;
  persona: StudioArtistRefView | null;
  /** Closes the menu at once, for every row that navigates. */
  onNavigate: () => void;
  /** Replaces the dropdown's root class and its leave class, for a host
   *  that lays the panel out and animates it itself. */
  className?: string;
  /** True in the phone sheet, which opens with the showcase's listening
   *  pages: on desktop the rail lists them. */
  isSheet?: boolean;
  /** The creator's public artist page, listed first (phone creator bar). */
  publicPageHref?: string;
}) {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const { isItemVisible } = useStudioMenuItemFilter();
  const shouldReplace = useStudioMenuShouldReplace();
  // On desktop Settings is the header's icon link; the phone sheet keeps its row.
  const studioItems = isSheet
    ? STUDIO_MENU_STUDIO_ITEMS
    : STUDIO_MENU_STUDIO_ITEMS.filter(
        (item) => item.to !== routes.studioSettings,
      );

  return (
    <div
      id={id}
      className={
        className
          ? `${className} ${styles.panelHosted}`
          : [styles.panel, isExiting && styles.panelClosing]
              .filter(Boolean)
              .join(" ")
      }
    >
      <StudioAccountMenuHeader
        persona={persona}
        onNavigate={onNavigate}
        shouldShowHeaderActions={!isSheet}
      />

      <div className={styles.scroll}>
        {isSheet && (
          <StudioAccountMenuGroup
            items={STUDIO_MENU_LISTEN_ITEMS_SHOWCASE.filter(isItemVisible)}
            onNavigate={onNavigate}
          />
        )}
        {publicPageHref && (
          <StudioAccountMenuGroup
            items={[
              {
                labelKey: "studio:creator.viewPublicPageCta",
                to: publicPageHref,
                icon: FiUser,
                audience: "everyone",
              },
            ]}
            onNavigate={onNavigate}
          />
        )}
        <StudioAccountMenuGroup
          headingKey="studio:shell.menu.group.creator"
          items={STUDIO_MENU_CREATOR_ITEMS.filter(isItemVisible)}
          onNavigate={onNavigate}
        />
        <StudioAccountMenuArtistPages
          persona={persona}
          onNavigate={onNavigate}
        />
        <StudioAccountMenuGroup
          headingKey="studio:rail.section.contribute"
          items={STUDIO_MENU_CONTRIBUTE_ITEMS.filter(isItemVisible)}
          onNavigate={onNavigate}
        />
        <StudioAccountMenuGroup
          headingKey="studio:rail.section.coop"
          items={STUDIO_MENU_COOP_ITEMS.filter(isItemVisible)}
          onNavigate={onNavigate}
        />
        <StudioAccountMenuGroup
          headingKey="studio:shell.menu.group.staff"
          items={STUDIO_MENU_STAFF_ITEMS.filter(isItemVisible)}
          onNavigate={onNavigate}
        />
        <StudioAccountMenuGroup
          headingKey="studio:brand.studioLabel"
          items={studioItems.filter(isItemVisible)}
          onNavigate={onNavigate}
        >
          <StudioAccountMenuHelp
            items={
              isShowcase
                ? STUDIO_MENU_HELP_ITEMS_SHOWCASE
                : STUDIO_MENU_HELP_ITEMS_LIVE
            }
            onNavigate={onNavigate}
          />
        </StudioAccountMenuGroup>
        {isSheet && (
          <>
            <div className={styles.divider} />
            <StudioThemeRow />
          </>
        )}
      </div>

      <div className={styles.footer}>
        <Link
          to={routes.feed}
          replace={shouldReplace}
          className={`${styles.item} ${styles.exit}`}
          onClick={onNavigate}
        >
          <FiArrowLeft aria-hidden className={styles.itemIcon} />
          <span className={styles.itemLabel}>
            {t("studio:shell.menu.backToQueerPulse")}
          </span>
        </Link>
        <Link
          to={routes.homepage}
          replace={shouldReplace}
          className={`${styles.item} ${styles.signOut}`}
          onClick={(event) => {
            // A modified click opens home in another tab; this one stays
            // signed in.
            if (event.metaKey || event.ctrlKey || event.shiftKey) return;
            // The session ends on arrival (useStudioSignOutAfterLeave), so
            // a leave prompt answered "Keep" leaves the member signed in.
            requestStudioSignOut();
            onNavigate();
          }}
        >
          <FiLogOut aria-hidden className={styles.itemIcon} />
          <span className={styles.itemLabel}>{t("nav:signOut")}</span>
        </Link>
      </div>
    </div>
  );
}
