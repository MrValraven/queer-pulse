import { FiAlertCircle } from "react-icons/fi";
import { useTablistKeys } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./adminUi.module.css";
import { useStripEdgeFade } from "./useStripEdgeFade";

export interface AdminTab {
  id: string;
  label: string;
  count?: number;
  /** The read behind `count` failed. With no `count`, the tab shows an alert
   *  mark where the number goes, so a failed read looks different from one
   *  still loading (which shows nothing). */
  isCountUnavailable?: boolean;
  /** Opt in for a `count` that can change while the strip is on screen (a
   *  queue a moderator is working through): the number rolls between values
   *  through `RollingNumber` instead of swapping in one frame. */
  isCountRolling?: boolean;
  /** `"alert"` paints the count pill in the danger tone for a tab holding
   *  overdue work. Unset keeps the neutral pill. */
  tone?: "alert";
  /** The visible pill text when it must differ from the raw number, e.g.
   *  "200+" for a capped count. It replaces `count`. */
  countLabel?: string;
  /** A screen-reader phrase for the count, e.g. "12 pending". When set, the
   *  visible pill is hidden from assistive tech and this text is read instead. */
  countAriaLabel?: string;
}

function CountPill({ tab }: { tab: AdminTab }) {
  const visible =
    tab.countLabel != null ? (
      tab.countLabel
    ) : tab.isCountRolling && tab.count != null ? (
      <RollingNumber value={String(tab.count)} numericValue={tab.count} />
    ) : (
      tab.count
    );
  return (
    <>
      <span
        data-tone={tab.tone}
        className={styles.tabCount}
        aria-hidden={tab.countAriaLabel ? true : undefined}
      >
        {visible}
      </span>
      {tab.countAriaLabel && (
        <span className="visuallyHidden">{tab.countAriaLabel}</span>
      )}
    </>
  );
}

function CountUnavailable() {
  const { t } = useTranslation();
  return (
    <span className={`${styles.tabCount} ${styles.tabCountUnavailable}`}>
      <FiAlertCircle aria-hidden />
      <span className="visuallyHidden">{t("admin:tabs.countUnavailable")}</span>
    </span>
  );
}

export function AdminTabs({
  tabs,
  active,
  onChange,
  className,
  idPrefix,
  label,
}: {
  /** Opt in to linking each tab to a panel: tab id `${idPrefix}-tab-${id}`,
   *  aria-controls `${idPrefix}-panel-${id}`. */
  idPrefix?: string;
  tabs: AdminTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  /** Names the tablist for assistive tech (its `aria-label`). */
  label?: string;
}) {
  // APG tablist keys: Arrow/Home/End with a roving tabIndex. This is the shared
  // admin tab strip, so every console that uses it inherits the fix.
  const { tabProps } = useTablistKeys(tabs.length, (index) => {
    const nextTab = tabs[index];
    if (nextTab) onChange(nextTab.id);
  });
  // A strip wider than its column scrolls sideways; the side that hides tabs
  // fades out, and the selected tab is kept in view.
  const { stripRef, edgeProps } = useStripEdgeFade<HTMLDivElement>(
    `${tabs.map((tab) => tab.id).join("|")}:${active}`,
    '[aria-selected="true"]',
  );

  return (
    <div
      ref={stripRef}
      className={[styles.tabs, className].filter(Boolean).join(" ")}
      role="tablist"
      aria-label={label}
      {...edgeProps}
    >
      {tabs.map((t, index) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          {...(idPrefix
            ? {
                id: `${idPrefix}-tab-${t.id}`,
                "aria-controls": `${idPrefix}-panel-${t.id}`,
              }
            : {})}
          {...tabProps(index, active === t.id)}
          className={[styles.tab, active === t.id && styles.tabOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count != null || t.countLabel != null ? (
            <CountPill tab={t} />
          ) : (
            t.isCountUnavailable && <CountUnavailable />
          )}
        </button>
      ))}
    </div>
  );
}
