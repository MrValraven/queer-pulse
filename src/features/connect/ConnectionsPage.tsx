import { useEffect, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import type { ConnectionSort } from "./api/connections.api";
import { type ConnectionView, type TabId } from "./connections.data";
import { useConnectionsList } from "./api/useConnectionsList";
import { useConnectionActions } from "./api/useConnectionActions";
import { ConnectionsFilters } from "./ConnectionsFilters";
import { ConnectionsHeader } from "./ConnectionsHeader";
import { ConnectionsTabs } from "./ConnectionsTabs";
import { ConnectionsTabPanels } from "./ConnectionsTabPanels";
import { useConnectionTabs } from "./useConnectionTabs";
import styles from "./ConnectionsPage.module.css";

/** How long typing pauses before the list is re-queried. */
const SEARCH_DEBOUNCE_MS = 250;

export function ConnectionsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [tab, setTab] = useState<TabId>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<ConnectionSort>("recent");

  // The list is a server query in live mode, so every keystroke would be a
  // request. The input stays instant and the query follows a beat later.
  const [debouncedTerm, setDebouncedTerm] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedTerm(searchTerm),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  // Keep the entrance skeleton (demo resolves instantly, so this preserves the
  // simulated load-in); live mode also shows it while the first fetch is pending.
  const simulating = useSimulatedLoad();
  const {
    views,
    loading: fetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
    refetch,
  } = useConnectionsList(tab, { searchTerm: debouncedTerm, sort });
  const loading = simulating || fetching;

  const tabs = useConnectionTabs();
  const {
    acceptRequest,
    declineRequest,
    withdrawRequest,
    unblock: unblockAction,
  } = useConnectionActions();

  // Every confirmation waits for the action to resolve. A failure resolves
  // `false` after the hook has rolled the card back and toasted the reason, so
  // the member is never told an accept/decline/withdraw went through when the
  // server rejected it.
  function onAccept(view: ConnectionView) {
    void acceptRequest({ slug: view.slug, id: view.meta.id }).then((ok) => {
      if (!ok) return;
      showToast(
        t("connect:toast.connected", { name: view.name.split(" ")[0]! }),
        "success",
      );
    });
  }
  function onDecline(view: ConnectionView) {
    void declineRequest({ slug: view.slug, id: view.meta.id }).then((ok) => {
      if (ok) showToast(t("connect:toast.declined"), "info");
    });
  }
  function onWithdraw(view: ConnectionView) {
    void withdrawRequest({ slug: view.slug, id: view.meta.id }).then((ok) => {
      if (ok) showToast(t("connect:toast.withdrawn"), "info");
    });
  }
  function onUnblock(view: ConnectionView) {
    void unblockAction({ slug: view.slug, id: view.meta.id });
    showToast(
      t("connect:toast.unblocked", { name: view.name.split(" ")[0]! }),
      "success",
    );
  }

  function clearSearch() {
    setSearchTerm("");
    setDebouncedTerm("");
    setSort("recent");
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <ConnectionsHeader />

        <ConnectionsTabs tabs={tabs} active={tab} onSelect={setTab} />

        <ConnectionsFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          sort={sort}
          onSortChange={setSort}
        />

        {isError && !loading ? (
          /* Someone's own connections must never be reported as none because
             a request failed: the empty panel here reads as "nobody accepted
             you", which is the cruellest possible way to render an outage. */
          <LoadErrorState
            onRetry={refetch}
            title={
              <Translation
                i18nKey="connect:page.loadError.title"
                components={{ em: <em /> }}
              />
            }
            description={t("connect:page.loadError.body")}
          />
        ) : (
          <ConnectionsTabPanels
            tab={tab}
            loading={loading}
            views={views}
            searchTerm={debouncedTerm}
            sort={sort}
            onClearSearch={clearSearch}
            actions={{ onAccept, onDecline, onWithdraw, onUnblock }}
          />
        )}

        {!loading && !isError && hasNextPage && (
          <div className={styles.loadMore}>
            <Button
              type="button"
              variant="ghost"
              disabled={isFetchingNextPage}
              onClick={fetchNextPage}
            >
              {isFetchingNextPage
                ? t("connect:page.loadMoreLoading")
                : t("connect:page.loadMore")}
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
