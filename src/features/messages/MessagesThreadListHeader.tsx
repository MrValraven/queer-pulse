import { FiUsers } from "react-icons/fi";
import { LuMessageSquarePlus } from "react-icons/lu";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import type { MailboxSummary } from "../../shared/api/mailboxViewer";
import { BrandMark, SearchInput } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InboxTabs } from "./InboxTabs";
import { MailboxSwitcher } from "./mailboxes/MailboxSwitcher";
import { FilterTabRowSkeleton } from "./MessagesSkeleton";
import { MessagesBackButton } from "./MessagesRailChrome";
import type { InboxTab } from "./threadFilters";
import styles from "./MessagesPage.module.css";

/**
 * The inbox's fixed top strip: wordmark + compose actions, the search box,
 * and (below it) the filter tabs — split out of `MessagesThreadList` to keep
 * both components under the 200-line cap. Purely presentational; all state
 * lives in the parent.
 *
 * The mailbox switcher follows the wordmark. A business, persona or company
 * mailbox only replies to conversations members start, so it shows no
 * compose buttons.
 */
export function MessagesThreadListHeader({
  query,
  onQueryChange,
  onCompose,
  onComposeGroup,
  loading,
  showTabs,
  activeTab,
  onTabChange,
  requestsCount,
  showBackButton,
  mailboxes,
  activeMailbox,
  onSelectMailbox,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onCompose: () => void;
  /** Opens the create-group picker. */
  onComposeGroup: () => void;
  /** True while the inbox's first load is in flight. Reserves the filter-tab
   *  row's own footprint via a skeleton (DES-192): `showTabs` is always
   *  false during this window, so without it the header grows by one row's
   *  height the moment the real tabs mount, under the finger on mobile. */
  loading: boolean;
  showTabs: boolean;
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  /** Incoming message-request count for the Requests tab badge (MSG-1). */
  requestsCount?: number;
  /** Mobile, where this route hides the app bar: a back chevron before the
   *  wordmark. */
  showBackButton: boolean;
  /** Every mailbox the member may read, profile first. */
  mailboxes: MailboxSummary[];
  /** The active mailbox, null until the mailboxes load. */
  activeMailbox: MailboxSummary | null;
  onSelectMailbox: (identityId: string) => void;
}) {
  const { t } = useTranslation();
  const isBusinessMailbox = !!activeMailbox && activeMailbox.kind !== "profile";
  return (
    <div className={styles.tpTop}>
      <div className={styles.tpHeadRow}>
        <div className={styles.tpHeadLead}>
          {showBackButton && <MessagesBackButton />}
          <Link to={routes.feed} className={styles.tpBrand}>
            {/* Decorative: the wordmark beside it already names the link.
                Hidden on narrow phones (see `.tpBrandMark`). */}
            <BrandMark
              state="compact"
              size={20}
              className={styles.tpBrandMark}
            />
            <span className={styles.tpBrandName}>
              <Translation
                i18nKey="shared:brand.wordmark"
                components={{ em: <em /> }}
              />
            </span>
          </Link>
          <MailboxSwitcher
            mailboxes={mailboxes}
            active={activeMailbox}
            onSelect={onSelectMailbox}
          />
        </div>
        {!isBusinessMailbox && (
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
        )}
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
          isBusinessMailbox={isBusinessMailbox}
        />
      )}
      {!showTabs && loading && <FilterTabRowSkeleton />}
    </div>
  );
}
