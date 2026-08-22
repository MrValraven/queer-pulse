import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnections } from "../../app/providers/useConnections";
import { useSocial } from "../../app/providers/useSocial";
import { useVouch } from "../../app/providers/useVouch";
import {
  CONNECTION_META,
  vouchNoteKey,
  type ConnectionView,
  type TabId,
} from "./connections.data";
import { useConnectionsList } from "./api/useConnectionsList";
import { useConnectionCounts } from "./api/useConnectionCounts";
import { useConnectionActions } from "./api/useConnectionActions";
import { ConnectionsAllTab } from "./ConnectionsAllTab";
import { ConnectionsHeader } from "./ConnectionsHeader";
import { ConnectionsTabs, type ConnectionsTab } from "./ConnectionsTabs";
import {
  BlockedPanel,
  IncomingPanel,
  SentPanel,
  VouchedPanel,
} from "./ConnectionsPanels";
import styles from "./ConnectionsPage.module.css";

export function ConnectionsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  // Provider arrays are the whole truth in demo mode; in live mode they are
  // permanently empty (the server owns the lists) — see `countFor` below.
  const { connected, incoming, sent } = useConnections();
  const { blocked, isBlocked } = useSocial();
  const { vouched, hasVouched } = useVouch();

  const [tab, setTab] = useState<TabId>("all");

  // Keep the entrance skeleton (demo resolves instantly, so this preserves the
  // simulated load-in); live mode also shows it while the first fetch is pending.
  const simulating = useSimulatedLoad();
  const {
    views,
    loading: fetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConnectionsList(tab);
  const loading = simulating || fetching;

  const {
    acceptRequest,
    declineRequest,
    withdrawRequest,
    unblock: unblockAction,
  } = useConnectionActions();

  const vouchedCount = useMemo(() => {
    const set = new Set<string>(vouched);
    for (const [slug, meta] of Object.entries(CONNECTION_META)) {
      if (meta.vouchBadge) set.add(slug);
    }
    return set.size;
  }, [vouched]);

  /**
   * Tab count badges.
   *
   * Demo: the provider arrays hold every relationship, so all five badges are
   * exact and render immediately.
   *
   * Live: those arrays are empty by design, which is why every badge used to
   * read 0. `useConnectionCounts` fetches every tab's total in one cheap call,
   * so all badges are accurate on first paint, and every connection action
   * invalidates the `["connections"]` prefix — which that query lives under —
   * so they stay accurate afterwards. (A per-tab cache of the freshest list
   * `total` used to be preferred over these counts, but only the mounted tab's
   * list refetches, so an inactive tab's remembered total went stale and beat
   * the corrected count. The counts query is the single source now.) The
   * blocked tab has no /connections counterpart; SocialProvider owns that
   * count in both modes, so it is always exact.
   */
  const counts = useConnectionCounts();

  const demoCounts: Record<TabId, number> = {
    all: connected.length,
    incoming: incoming.length,
    sent: sent.length,
    blocked: blocked.length,
    vouched: vouchedCount,
  };
  const countFor = (id: TabId): number | undefined => {
    if (demoMode) return demoCounts[id];
    if (id === "blocked") return blocked.length;
    return counts[id];
  };

  const tabs: ConnectionsTab[] = [
    { id: "all", label: t("connect:tabs.all"), count: countFor("all") },
    {
      id: "incoming",
      label: t("connect:tabs.incoming"),
      count: countFor("incoming"),
      accent: (countFor("incoming") ?? 0) > 0,
    },
    { id: "sent", label: t("connect:tabs.sent"), count: countFor("sent") },
    {
      id: "blocked",
      label: t("connect:tabs.blocked"),
      count: countFor("blocked"),
    },
    {
      id: "vouched",
      label: t("connect:tabs.vouched"),
      count: countFor("vouched"),
    },
  ];

  // Every confirmation waits for the action to resolve. A failure resolves
  // `false` after the hook has rolled the card back and toasted the reason, so
  // the member is never told an accept/decline/withdraw went through when the
  // server rejected it.
  function onAccept(v: ConnectionView) {
    void acceptRequest({ slug: v.slug, id: v.meta.id }).then((ok) => {
      if (!ok) return;
      showToast(
        t("connect:toast.connected", { name: v.name.split(" ")[0]! }),
        "success",
      );
    });
  }
  function onDecline(v: ConnectionView) {
    void declineRequest({ slug: v.slug, id: v.meta.id }).then((ok) => {
      if (ok) showToast(t("connect:toast.declined"), "info");
    });
  }
  function onWithdraw(v: ConnectionView) {
    void withdrawRequest({ slug: v.slug, id: v.meta.id }).then((ok) => {
      if (ok) showToast(t("connect:toast.withdrawn"), "info");
    });
  }
  function onUnblock(v: ConnectionView) {
    void unblockAction({ slug: v.slug, id: v.meta.id });
    showToast(
      t("connect:toast.unblocked", { name: v.name.split(" ")[0]! }),
      "success",
    );
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <ConnectionsHeader />

        <ConnectionsTabs tabs={tabs} active={tab} onSelect={setTab} />

        {tab === "all" && (
          <ConnectionsAllTab
            loading={loading}
            connected={views}
            allowMorePool={demoMode}
            isBlocked={isBlocked}
            onUnblock={onUnblock}
            // Every card here is an accepted connection, so "Message" deep-links
            // straight into that person's chat (same state shape MessagesPage reads).
            onMessage={(slug, name) =>
              void navigate(routes.messages, { state: { to: { slug, name } } })
            }
          />
        )}

        {tab === "incoming" && (
          <IncomingPanel
            loading={loading}
            views={views}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        )}

        {tab === "sent" && (
          <SentPanel loading={loading} views={views} onWithdraw={onWithdraw} />
        )}

        {tab === "blocked" && (
          <BlockedPanel loading={loading} views={views} onUnblock={onUnblock} />
        )}

        {tab === "vouched" && (
          <VouchedPanel
            loading={loading}
            views={views}
            noteFor={(v) =>
              t(vouchNoteKey(v.meta.vouchBadge, hasVouched(v.slug)))
            }
          />
        )}

        {!loading && hasNextPage && (
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
