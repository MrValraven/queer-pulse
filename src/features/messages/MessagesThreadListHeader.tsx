import { FiUsers } from "react-icons/fi";
import { LuMessageSquarePlus } from "react-icons/lu";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { BrandMark, SearchInput } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InboxTabs } from "./InboxTabs";
import type { InboxTab } from "./threadFilters";
import styles from "./MessagesPage.module.css";

/**
 * The inbox's fixed top strip: wordmark + compose actions, the search box,
 * and (below it) the filter tabs — split out of `MessagesThreadList` to keep
 * both components under the 200-line cap. Purely presentational; all state
 * lives in the parent.
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
        <Link to={routes.feed} className={styles.tpBrand}>
          {/* Decorative: the wordmark beside it already names the link. */}
          <BrandMark state="compact" size={20} />
          <span className={styles.tpBrandName}>
            <Translation
              i18nKey="shared:brand.wordmark"
              components={{ em: <em /> }}
            />
          </span>
        </Link>
        <div className={styles.tpHeadActions}>
          <button
            type="button"
            className={styles.composeBtn}
            title={t("messages:group.newTooltip")}
            aria-label={t("messages:group.newTooltip")}
            onClick={onComposeGroup}
          >
            <FiUsers aria-hidden />
          </button>
          <button
            type="button"
            className={styles.composeBtn}
            title={t("messages:thread.composeTooltip")}
            aria-label={t("messages:thread.composeTooltip")}
            onClick={onCompose}
          >
            <LuMessageSquarePlus aria-hidden />
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
