import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "../PieceRecordPage.module.css";

export type PieceRecordTabId = "brief" | "care" | "money" | "history" | "after";

export interface PieceTabsNavProps {
  tab: PieceRecordTabId;
  onChange: (tab: PieceRecordTabId) => void;
  /** Count of open publish-gate items, shown as a `.pip` badge on the Care tab. */
  openGateCount: number;
}

/** Brief/Care/Money/History/After tab nav for the piece record — the Care
 *  tab carries a pip count of open publish-gate items when any are open. */
export function PieceTabsNav({
  tab,
  onChange,
  openGateCount,
}: PieceTabsNavProps) {
  const { t } = useTranslation();
  const TABS: { id: PieceRecordTabId; label: string }[] = [
    { id: "brief", label: t("magazine:piece.tabs.brief") },
    { id: "care", label: t("magazine:piece.tabs.care") },
    { id: "money", label: t("magazine:piece.tabs.money") },
    { id: "history", label: t("magazine:piece.tabs.history") },
    { id: "after", label: t("magazine:piece.tabs.after") },
  ];
  return (
    <nav
      className={styles.tabs}
      aria-label={t("magazine:piece.tabs.ariaLabel")}
    >
      {TABS.map((tabItem) => (
        <button
          key={tabItem.id}
          type="button"
          className={cx(
            styles.tabButton,
            tab === tabItem.id && styles.tabButtonActive,
          )}
          aria-current={tab === tabItem.id}
          onClick={() => onChange(tabItem.id)}
        >
          {tabItem.label}
          {tabItem.id === "care" && openGateCount > 0 && (
            <span className={styles.pip}>{openGateCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
