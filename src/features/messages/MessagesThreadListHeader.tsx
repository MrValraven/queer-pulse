import { FeatureHelp, SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InboxTabs } from "./InboxTabs";
import type { InboxTab } from "./threadFilters";
import styles from "./MessagesPage.module.css";

/**
 * The inbox's fixed top strip: title + compose actions, the search box, and
 * (below it) the filter tabs — split out of `MessagesThreadList` to keep both
 * components under the 200-line cap. Purely presentational; all state lives
 * in the parent.
 */
export function MessagesThreadListHeader({
  query,
  onQueryChange,
  onCompose,
  onComposeGroup,
  showTabs,
  activeTab,
  onTabChange,
  requestsCount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onCompose: () => void;
  /** Opens the create-group picker. */
  onComposeGroup: () => void;
  showTabs: boolean;
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  /** Incoming message-request count for the Requests tab badge (MSG-1). */
  requestsCount?: number;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.tpTop}>
      <div className={styles.tpHeadRow}>
        <div className={styles.tpTitle}>
          {t("messages:thread.title")}
          <FeatureHelp id="messages.inbox" />
        </div>
        <div className={styles.tpHeadActions}>
          <button
            type="button"
            className={styles.composeBtn}
            title={t("messages:group.newTooltip")}
            aria-label={t("messages:group.newTooltip")}
            onClick={onComposeGroup}
          >
            <svg
              width={17}
              height={17}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
            >
              <circle cx="7" cy="7.5" r="2.6" stroke="currentColor" strokeWidth={1.5} />
              <path
                d="M2.5 15.5c0-2.2 2-3.6 4.5-3.6s4.5 1.4 4.5 3.6"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <circle cx="14" cy="6.5" r="2" stroke="currentColor" strokeWidth={1.5} />
              <path
                d="M13 11.2c2.2 0 4 1.2 4 3.3"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.composeBtn}
            title={t("messages:thread.composeTooltip")}
            aria-label={t("messages:thread.composeTooltip")}
            onClick={onCompose}
          >
            <svg width={15} height={15} viewBox="0 0 15 15" fill="none" aria-hidden>
              <path
                d="M10.5 2L13 4.5l-7 7H3.5V9l7-7Z"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <path
                d="M2 13h11"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder={t("messages:thread.searchPlaceholder")}
        ariaLabel={t("messages:thread.searchAria")}
      />
      {showTabs && (
        <InboxTabs
          active={activeTab}
          onChange={onTabChange}
          requestsCount={requestsCount}
        />
      )}
    </div>
  );
}
