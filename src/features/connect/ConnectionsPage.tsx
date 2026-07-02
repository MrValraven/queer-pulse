import { useMemo, useState } from "react";
import { FiInfo, FiUserPlus } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useConnect } from "../../app/providers/ConnectProvider";
import { useConnections } from "../../app/providers/ConnectionsProvider";
import { useSocial } from "../../app/providers/SocialProvider";
import { useVouch } from "../../app/providers/VouchProvider";
import {
  CONNECTION_META,
  connectionViews,
  vouchNote,
  type ConnectionView,
  type TabId,
} from "./connections.data";
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
  const loading = useSimulatedLoad();
  const { showToast } = useToast();
  const { openConnect } = useConnect();
  const { connected, incoming, sent, accept, decline, withdraw } =
    useConnections();
  const { blocked, isBlocked, toggleBlock } = useSocial();
  const { vouched, hasVouched } = useVouch();

  const [tab, setTab] = useState<TabId>("all");

  const blockedViews = useMemo(() => connectionViews(blocked), [blocked]);

  const vouchedSlugs = useMemo(() => {
    const set = new Set<string>(vouched);
    for (const [slug, meta] of Object.entries(CONNECTION_META)) {
      if (meta.vouchBadge) set.add(slug);
    }
    return [...set];
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
    { id: "blocked", label: "Blocked", count: blockedViews.length },
    { id: "vouched", label: "Vouched-for", count: vouchedSlugs.length },
  ];

  function acceptRequest(v: ConnectionView) {
    accept(v.slug);
    showToast(`Connected with ${v.name.split(" ")[0]}`, "success");
  }
  function declineRequest(v: ConnectionView) {
    decline(v.slug);
    showToast("Politely declined", "info");
  }
  function withdrawRequest(v: ConnectionView) {
    withdraw(v.slug);
    showToast("Request withdrawn", "info");
  }
  function unblock(v: ConnectionView) {
    toggleBlock(v.slug);
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
            connected={connected}
            isBlocked={isBlocked}
            onUnblock={unblock}
            onMessage={openConnect}
          />
        )}

        {tab === "incoming" && (
          <IncomingPanel
            loading={loading}
            views={connectionViews(incoming)}
            onAccept={acceptRequest}
            onDecline={declineRequest}
          />
        )}

        {tab === "sent" && (
          <SentPanel
            loading={loading}
            views={connectionViews(sent)}
            onWithdraw={withdrawRequest}
          />
        )}

        {tab === "blocked" && (
          <BlockedPanel
            loading={loading}
            views={blockedViews}
            onUnblock={unblock}
          />
        )}

        {tab === "vouched" && (
          <VouchedPanel
            loading={loading}
            views={connectionViews(vouchedSlugs)}
            noteFor={(v) => vouchNote(v.slug, hasVouched(v.slug))}
          />
        )}
      </div>
    </PageShell>
  );
}
