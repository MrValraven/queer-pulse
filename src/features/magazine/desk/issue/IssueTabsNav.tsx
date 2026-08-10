import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../../IssueProductionPage.module.css";

export type IssueTabId = "runningOrder" | "coverContents" | "digestSocial" | "archive";

export interface IssueTabsNavProps {
  tab: IssueTabId;
  onChange: (tab: IssueTabId) => void;
}

const ISSUE_TAB_IDS: IssueTabId[] = ["runningOrder", "coverContents", "digestSocial", "archive"];

const ISSUE_TAB_LABEL_KEYS: Record<IssueTabId, string> = {
  runningOrder: "magazine:issue.tabs.runningOrder",
  coverContents: "magazine:issue.tabs.coverContents",
  digestSocial: "magazine:issue.tabs.digestSocial",
  archive: "magazine:issue.tabs.archive",
};

/** Running order / Cover & contents / Digest & social / Archive tab nav for
 *  the issue-production page. */
export function IssueTabsNav({ tab, onChange }: IssueTabsNavProps) {
  const { t } = useTranslation();

  return (
    <nav className={styles.tabs} aria-label={t("magazine:issue.tabs.ariaLabel")}>
      {ISSUE_TAB_IDS.map((tabId) => (
        <button
          key={tabId}
          type="button"
          className={cx(styles.tabButton, tab === tabId && styles.tabButtonActive)}
          aria-current={tab === tabId}
          onClick={() => onChange(tabId)}
        >
          {t(ISSUE_TAB_LABEL_KEYS[tabId])}
        </button>
      ))}
    </nav>
  );
}
