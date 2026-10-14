import { FiAlertCircle } from "react-icons/fi";
import { useTablistKeys } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./adminUi.module.css";

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
}: {
  /** Opt in to linking each tab to a panel: tab id `${idPrefix}-tab-${id}`,
   *  aria-controls `${idPrefix}-panel-${id}`. */
  idPrefix?: string;
  tabs: AdminTab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  // APG tablist keys: Arrow/Home/End with a roving tabIndex. This is the shared
  // admin tab strip, so every console that uses it inherits the fix.
  const { tabProps } = useTablistKeys(tabs.length, (index) => {
    const nextTab = tabs[index];
    if (nextTab) onChange(nextTab.id);
  });

  return (
    <div
      className={[styles.tabs, className].filter(Boolean).join(" ")}
      role="tablist"
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
          {t.count != null ? (
            <span className={styles.tabCount}>
              {t.isCountRolling ? (
                <RollingNumber value={String(t.count)} numericValue={t.count} />
              ) : (
                t.count
              )}
            </span>
          ) : (
            t.isCountUnavailable && <CountUnavailable />
          )}
        </button>
      ))}
    </div>
  );
}
