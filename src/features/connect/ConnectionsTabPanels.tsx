import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSocial } from "../../app/providers/useSocial";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ConnectionsAllTab } from "./ConnectionsAllTab";
import {
  BlockedPanel,
  IncomingPanel,
  SentPanel,
  VouchedPanel,
} from "./ConnectionsPanels";
import type { ConnectionSort } from "./api/connections.api";
import {
  vouchNoteKey,
  type ConnectionView,
  type TabId,
} from "./connections.data";

export interface ConnectionsTabActions {
  onAccept: (view: ConnectionView) => void;
  onDecline: (view: ConnectionView) => void;
  onWithdraw: (view: ConnectionView) => void;
  onUnblock: (view: ConnectionView) => void;
}

/** Renders the one panel the active tab calls for. */
export function ConnectionsTabPanels({
  tab,
  loading,
  views,
  searchTerm,
  sort,
  onClearSearch,
  actions,
}: {
  tab: TabId;
  loading: boolean;
  views: ConnectionView[];
  searchTerm: string;
  sort: ConnectionSort;
  onClearSearch: () => void;
  actions: ConnectionsTabActions;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { isBlocked } = useSocial();
  const { hasVouched } = useVouch();
  const navigate = useNavigate();

  if (tab === "all") {
    return (
      <ConnectionsAllTab
        loading={loading}
        connected={views}
        searchTerm={searchTerm}
        sort={sort}
        onClearSearch={onClearSearch}
        allowMorePool={demoMode}
        isBlocked={isBlocked}
        onUnblock={actions.onUnblock}
        // Every card here is an accepted connection, so "Message" deep-links
        // straight into that person's chat (same state shape MessagesPage reads).
        onMessage={(slug, name) =>
          void navigate(routes.messages, { state: { to: { slug, name } } })
        }
      />
    );
  }

  if (tab === "incoming") {
    return (
      <IncomingPanel
        loading={loading}
        views={views}
        onAccept={actions.onAccept}
        onDecline={actions.onDecline}
      />
    );
  }

  if (tab === "sent") {
    return (
      <SentPanel
        loading={loading}
        views={views}
        onWithdraw={actions.onWithdraw}
      />
    );
  }

  if (tab === "blocked") {
    return (
      <BlockedPanel
        loading={loading}
        views={views}
        onUnblock={actions.onUnblock}
      />
    );
  }

  return (
    <VouchedPanel
      loading={loading}
      views={views}
      noteFor={(view) =>
        t(vouchNoteKey(view.meta.vouchBadge, hasVouched(view.slug)))
      }
    />
  );
}
