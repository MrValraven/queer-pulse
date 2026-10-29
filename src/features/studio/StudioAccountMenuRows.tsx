import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { NavLink } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { useTheme } from "../../app/providers/themeContext";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioCounterWindows } from "./api/useStudioMenuCounts";
import { useStudioReviewCounts } from "./api/useStudioReviewCounts";
import type { StudioAccountMenuItem } from "./studioAccountMenu.data";
import { useStudioMenuShouldReplace } from "./studioAccountMenuNavigation";
import { SUSTAINER_SINCE_DATE, YEARLY_GIVING } from "./studioShell.data";
import { StudioCreditsBadge } from "./StudioCreditsBadge";
import { StudioMyClaimsBadge } from "./StudioMyClaimsBadge";
import { STUDIO_EXIT, STUDIO_SPRING } from "./studioMotion";
import { StudioReviewClaimsBadge } from "./StudioReviewClaimsBadge";
import { StudioSalesPendingBadge } from "./StudioSalesPendingBadge";
import { studioFlagReviewTabPath } from "./StudioReviewTabs.data";
import styles from "./StudioAccountMenu.module.css";

const INSTANT = { duration: 0 };

/** A count pill beside a row's label. It springs in and fades out, and its
 *  sentence (`labelKey`, counted) rides in the link's accessible name. */
function StudioMenuCountBadge({
  count,
  labelKey,
  id,
}: {
  count: number;
  labelKey: string;
  id: string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key={id}
          className={`${styles.countBadge} ${styles.itemBadge}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: reducedMotion ? INSTANT : STUDIO_SPRING,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            transition: reducedMotion ? INSTANT : STUDIO_EXIT,
          }}
        >
          <span aria-hidden>{count}</span>
          <span className="visuallyHidden">
            {", "}
            <span>{t(labelKey, { count })}</span>
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}

/**
 * The staff Flag review row: its claims and disputes counts and the tab that
 * has work waiting, so the badge never lands staff on the wrong queue. It
 * mounts only on that row, which the menu shows to staff alone, and reads
 * the one counts query the review tabs and the Claims badge share.
 */
function StudioReviewRowBadges() {
  const { disputesWaiting } = useStudioReviewCounts();
  return (
    <>
      <StudioReviewClaimsBadge />
      <StudioMenuCountBadge
        id="disputes-waiting"
        count={disputesWaiting}
        labelKey="studio:shell.menu.disputesBadge"
      />
    </>
  );
}

function useReviewRowHref(): string {
  const { claimsWaiting, disputesWaiting } = useStudioReviewCounts();
  if (claimsWaiting > 0) return studioFlagReviewTabPath("claims");
  if (disputesWaiting > 0) return studioFlagReviewTabPath("disputes");
  return routes.studioFlagReview;
}

/** The staff row as a whole: its link target depends on the counts, so
 *  the hooks stay inside a component only staff ever mount. */
function StudioReviewMenuLink({
  item,
  onNavigate,
  isNested,
}: {
  item: StudioAccountMenuItem;
  onNavigate: () => void;
  isNested: boolean;
}) {
  const href = useReviewRowHref();
  return (
    <StudioMenuRowLink
      item={item}
      to={href}
      onNavigate={onNavigate}
      isNested={isNested}
    >
      <StudioReviewRowBadges />
    </StudioMenuRowLink>
  );
}

/** The row markup every menu link shares: icon, label, then its badges. */
function StudioMenuRowLink({
  item,
  to,
  onNavigate,
  isNested,
  children,
}: {
  item: StudioAccountMenuItem;
  to: string;
  onNavigate: () => void;
  isNested: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const shouldReplace = useStudioMenuShouldReplace();
  const Icon = item.icon;
  return (
    <NavLink
      to={to}
      replace={shouldReplace}
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
      {children}
    </NavLink>
  );
}

/** The artist's counter-window row (DES-84): it shows only while a claim on
 *  one of their tracks can still be answered, folding in and out with the
 *  count, and opens the oldest one's track page. */
function StudioCounterWindowsMenuLink({
  item,
  onNavigate,
  isNested,
}: {
  item: StudioAccountMenuItem;
  onNavigate: () => void;
  isNested: boolean;
}) {
  const counterWindows = useStudioCounterWindows();
  return (
    <Collapse isOpen={counterWindows.count > 0}>
      <StudioMenuRowLink
        item={item}
        to={counterWindows.href ?? item.to}
        onNavigate={onNavigate}
        isNested={isNested}
      >
        <StudioMenuCountBadge
          id="counter-windows"
          count={counterWindows.count}
          labelKey="studio:shell.menu.counterWindowsBadge"
        />
      </StudioMenuRowLink>
    </Collapse>
  );
}

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
  if (item.badge === "review") {
    return (
      <StudioReviewMenuLink
        item={item}
        onNavigate={onNavigate}
        isNested={isNested}
      />
    );
  }
  if (item.badge === "counterWindows") {
    return (
      <StudioCounterWindowsMenuLink
        item={item}
        onNavigate={onNavigate}
        isNested={isNested}
      />
    );
  }
  return (
    <StudioMenuRowLink
      item={item}
      to={item.to}
      onNavigate={onNavigate}
      isNested={isNested}
    >
      {item.badge === "creditRequests" && (
        <StudioCreditsBadge className={styles.itemBadge} />
      )}
      {item.badge === "myClaims" && (
        <StudioMyClaimsBadge className={styles.itemBadge} />
      )}
      {item.badge === "salesPending" && (
        <StudioSalesPendingBadge className={styles.itemBadge} />
      )}
    </StudioMenuRowLink>
  );
}

/** Light/dark switch. It acts in place, so the menu stays open. The label
 *  names the theme a press switches to, as the app's AccountMenu does. */
export function StudioThemeRow() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="quiet"
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
    </Button>
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
