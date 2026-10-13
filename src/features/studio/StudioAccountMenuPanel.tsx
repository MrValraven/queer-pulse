import { useId, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { useTheme } from "../../app/providers/themeContext";
import { Avatar } from "../../shared/components/ui";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioShowcase } from "./useStudioShowcase";
import {
  STUDIO_CREATOR_ITEMS,
  STUDIO_LISTENER_ITEMS,
  type StudioAccountMenuItem,
} from "./studioAccountMenu.data";
import styles from "./StudioAccountMenu.module.css";

/** The open panel of {@link StudioAccountMenu}: the member's header, the
 *  library, their artist pages, the creator pages, the theme switch, and the
 *  exits back to QueerPulse and out of the session. The phone side sheet
 *  (StudioNavSheet) reuses it full height through `className` and adds its
 *  own rows through `children`. */
export function StudioAccountMenuPanel({
  id,
  isExiting,
  persona,
  onNavigate,
  className,
  children,
}: {
  id: string;
  isExiting: boolean;
  persona: StudioArtistRefView | null;
  /** Closes the menu at once, for every row that navigates. */
  onNavigate: () => void;
  /** Replaces the dropdown's root class and its leave class, for a host
   *  that lays the panel out and animates it itself. */
  className?: string;
  /** Extra rows at the end of the scroll region, after the theme row. */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const identity = useAccountIdentity();
  const isShowcase = useStudioShowcase();
  const { uploadablePersonas } = useStudioAccess();
  const { signOut } = useAuth();
  const artistPagesLabelId = useId();
  const hasArtistPages = uploadablePersonas.length > 0;
  const isItemVisible = (item: StudioAccountMenuItem) =>
    item.audience === "everyone" ||
    (item.audience === "artist" && (hasArtistPages || isShowcase)) ||
    (item.audience === "showcase" && isShowcase);
  const creatorItems = STUDIO_CREATOR_ITEMS.filter(isItemVisible);

  return (
    <div
      id={id}
      className={
        className ??
        [styles.panel, isExiting && styles.panelClosing]
          .filter(Boolean)
          .join(" ")
      }
    >
      <div className={styles.header}>
        <Avatar
          initials={identity.initials}
          src={identity.photo}
          size={36}
          alt=""
        />
        <div className={styles.headerText}>
          <div className={styles.headerName}>{identity.name}</div>
          {persona && (
            <div className={styles.headerMeta}>
              {t("studio:creator.avatarLabel", { name: persona.name })}
            </div>
          )}
        </div>
      </div>

      <div className={styles.scroll}>
        {STUDIO_LISTENER_ITEMS.filter(isItemVisible).map((item) => (
          <StudioAccountMenuLink
            key={item.to}
            item={item}
            onNavigate={onNavigate}
          />
        ))}
        {hasArtistPages && (
          <>
            <div className={styles.divider} />
            <div className={styles.groupLabel} id={artistPagesLabelId}>
              {t("studio:shell.menu.artistPages")}
            </div>
            <div role="group" aria-labelledby={artistPagesLabelId}>
              {uploadablePersonas.map((artist) => (
                <Link
                  key={artist.id}
                  to={artist.href}
                  className={styles.item}
                  onClick={onNavigate}
                >
                  <Avatar
                    initials={artist.initials}
                    src={artist.avatarUrl ?? undefined}
                    size={22}
                    alt=""
                  />
                  <span className={styles.itemLabel}>{artist.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}
        {creatorItems.length > 0 && (
          <>
            <div className={styles.divider} />
            {creatorItems.map((item) => (
              <StudioAccountMenuLink
                key={item.to}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </>
        )}
        <div className={styles.divider} />
        <StudioThemeRow />
        {children}
      </div>

      <div className={styles.footer}>
        <Link
          to={routes.feed}
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
          className={`${styles.item} ${styles.signOut}`}
          onClick={() => {
            signOut();
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

/** One navigating row: icon and label, closing the menu on click. */
function StudioAccountMenuLink({
  item,
  onNavigate,
}: {
  item: StudioAccountMenuItem;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <Link to={item.to} className={styles.item} onClick={onNavigate}>
      <Icon aria-hidden className={styles.itemIcon} />
      <span className={styles.itemLabel}>{t(item.labelKey)}</span>
    </Link>
  );
}

/** Light/dark switch. It acts in place, so the menu stays open. The label
 *  names the theme a press switches to, as the app's AccountMenu does. */
function StudioThemeRow() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className={`${styles.item} ${styles.itemButton}`}
      onClick={toggleTheme}
    >
      {isDark ? (
        <FiSun aria-hidden className={styles.itemIcon} />
      ) : (
        <FiMoon aria-hidden className={styles.itemIcon} />
      )}
      <span className={styles.itemLabel}>
        {t(
          isDark
            ? "shared:accountMenu.items.lightMode"
            : "shared:accountMenu.items.darkMode",
        )}
      </span>
    </button>
  );
}
