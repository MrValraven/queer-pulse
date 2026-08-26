import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnections } from "../../app/providers/useConnections";
import { useSocial } from "../../app/providers/useSocial";
import { useVouch } from "../../app/providers/useVouch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionCounts } from "./api/useConnectionCounts";
import { CONNECTION_META, type TabId } from "./connections.data";
import type { ConnectionsTab } from "./ConnectionsTabs";

/**
 * The five tab descriptors with their count badges.
 *
 * Demo: the provider arrays hold every relationship, so all five badges are
 * exact and render immediately.
 *
 * Live: those arrays are empty by design. `useConnectionCounts` fetches every
 * tab's total in one cheap call, so all badges are accurate on first paint,
 * and every connection action invalidates the `["connections"]` prefix, which
 * that query lives under, so they stay accurate afterwards. The blocked tab
 * has no /connections counterpart; SocialProvider owns that count in both
 * modes, so it is always exact.
 *
 * The counts deliberately ignore the search term: a badge is "how many people
 * are in this tab", and having it shrink as someone types would make the tabs
 * unreadable while searching.
 */
export function useConnectionTabs(): ConnectionsTab[] {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { connected, incoming, sent } = useConnections();
  const { blocked } = useSocial();
  const { vouched } = useVouch();
  const counts = useConnectionCounts();

  const vouchedCount = useMemo(() => {
    const slugs = new Set<string>(vouched);
    for (const [slug, meta] of Object.entries(CONNECTION_META)) {
      if (meta.vouchBadge) slugs.add(slug);
    }
    return slugs.size;
  }, [vouched]);

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

  return [
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
}
