import { NavLink } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../app/providers/themeContext";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioAccountMenuItem } from "./studioAccountMenu.data";
import { SUSTAINER_SINCE_DATE, YEARLY_GIVING } from "./studioShell.data";
import { StudioCreditsBadge } from "./StudioCreditsBadge";
import { StudioMyClaimsBadge } from "./StudioMyClaimsBadge";
import { StudioReviewClaimsBadge } from "./StudioReviewClaimsBadge";
import styles from "./StudioAccountMenu.module.css";

/** One navigating row: icon, label and its live count, closing the menu on
 *  click. The current page's row reads active (NavLink sets
 *  aria-current="page"). `isNested` indents a row a toggle revealed. */
export function StudioAccountMenuLink({
  item,
  onNavigate,
  isNested = false,
}: {
  item: StudioAccountMenuItem;
  onNavigate: () => void;
  isNested?: boolean;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          styles.item,
          isNested && styles.itemNested,
          isActive && styles.itemActive,
        ]
          .filter(Boolean)
          .join(" ")
      }
      onClick={onNavigate}
    >
      <Icon aria-hidden className={styles.itemIcon} />
      <span className={styles.itemLabel}>{t(item.labelKey)}</span>
      {item.badge === "creditRequests" && (
        <StudioCreditsBadge className={styles.itemBadge} />
      )}
      {item.badge === "myClaims" && (
        <StudioMyClaimsBadge className={styles.itemBadge} />
      )}
      {item.badge === "claimsWaiting" && <StudioReviewClaimsBadge />}
    </NavLink>
  );
}

/** Light/dark switch. It acts in place, so the menu stays open. The label
 *  names the theme a press switches to, as the app's AccountMenu does. */
export function StudioThemeRow() {
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

/** The demo member's giving line under their name, as the showcase rail's
 *  footer used to read it. */
export function StudioAccountMenuGiving() {
  const format = useFormat();
  return (
    <p className={styles.headerGiving}>
      <Translation
        i18nKey="studio:rail.foot.sustainedSince"
        components={{ em: <em /> }}
        values={{
          date: format.date(SUSTAINER_SINCE_DATE, {
            month: "long",
            year: "numeric",
          }),
        }}
      />
      <span className={styles.headerGivingPaid}>
        <Translation
          i18nKey="studio:rail.foot.paid"
          components={{ b: <b /> }}
          values={{
            amount: format.currency(YEARLY_GIVING.amount),
            count: YEARLY_GIVING.artistCount,
          }}
        />
      </span>
    </p>
  );
}
