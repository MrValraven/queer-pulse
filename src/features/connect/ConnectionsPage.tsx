import { useMemo, useState } from "react";
import { FiInfo, FiUserPlus } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useConnect } from "../../app/providers/ConnectProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnections } from "../../app/providers/ConnectionsProvider";
import { useSocial } from "../../app/providers/SocialProvider";
import { useVouch } from "../../app/providers/VouchProvider";
import {
  CONNECTION_META,
  vouchNote,
  type ConnectionView,
  type TabId,
} from "./connections.data";
import { useConnectionsList } from "./api/useConnectionsList";
import { useConnectionActions } from "./api/useConnectionActions";
import { ConnectionsAllTab } from "./ConnectionsAllTab";
import { ConnectionsTabs, type ConnectionsTab } from "./ConnectionsTabs";
import {
  BlockedPanel,
  IncomingPanel,
  SentPanel,
  VouchedPanel,
} from "./ConnectionsPanels";
import styles from "./ConnectionsPage.module.css";

export function ConnectionsPage() {
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { openConnect } = useConnect();
  // Provider arrays still drive the tab COUNT badges. In demo they're exact; in
  // live mode they're a best-effort hint (a full per-tab count fetch would be
  // wasteful just to badge inactive tabs) — a documented, non-breaking gap.
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

  const tabs: ConnectionsTab[] = [
    { id: "all", label: "All connections", count: connected.length },
    {
      id: "incoming",
      label: "Incoming requests",
      count: incoming.length,
      accent: incoming.length > 0,
    },
    { id: "sent", label: "Sent", count: sent.length },
    { id: "blocked", label: "Blocked", count: blocked.length },
    { id: "vouched", label: "Vouched-for", count: vouchedCount },
  ];

  function onAccept(v: ConnectionView) {
    void acceptRequest({ slug: v.slug, id: v.meta.id });
    showToast(`Connected with ${v.name.split(" ")[0]}`, "success");
  }
  function onDecline(v: ConnectionView) {
    void declineRequest({ slug: v.slug, id: v.meta.id });
    showToast("Politely declined", "info");
  }
  function onWithdraw(v: ConnectionView) {
    void withdrawRequest({ slug: v.slug, id: v.meta.id });
    showToast("Request withdrawn", "info");
  }
  function onUnblock(v: ConnectionView) {
    void unblockAction({ slug: v.slug, id: v.meta.id });
    showToast(`Unblocked ${v.name.split(" ")[0]}`, "success");
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.headText}>
            <div className={styles.eyebrow}>Your network</div>
            <h1 className={styles.h1}>
              People you've <em>actually met.</em>
            </h1>
            <p className={styles.lead}>
              QueerPulse doesn't do followers. You connect with people once
              you've met them — at a gathering, through someone, or because they
              vouched for you. Quality over count.
            </p>
          </div>
          <div className={styles.headActions}>
            <Button variant="primary" to={routes.invite}>
              <FiUserPlus />
              Invite a friend
            </Button>
          </div>
        </header>

        <div className={styles.langNote}>
          <span>
            <FiInfo />
          </span>
          <span>
            <b>No follower counts on purpose.</b> If you're looking to "follow a
            member's posts" without connecting first, use the Communities feed
            instead. Connections are a two-way thing — they unlock messaging and
            tagged updates.
          </span>
        </div>

        <ConnectionsTabs tabs={tabs} active={tab} onSelect={setTab} />

        {tab === "all" && (
          <ConnectionsAllTab
            loading={loading}
            connected={views}
            allowMorePool={demoMode}
            isBlocked={isBlocked}
            onUnblock={onUnblock}
            onMessage={openConnect}
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
            noteFor={(v) => vouchNote(v.slug, hasVouched(v.slug))}
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
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
