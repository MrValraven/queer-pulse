import { Tabs } from "../../shared/components/ui";
import type { TabId } from "./connections.data";
import styles from "./ConnectionsPage.module.css";

export type ConnectionsTab = {
  id: TabId;
  label: string;
  /** Omitted when no honest count is known yet — the badge is then not rendered. */
  count?: number;
  /**
   * Previously tinted the incoming-request badge with the coral accent. The
   * shared `Tabs` primitive has no per-tab badge tint, so this flag no longer
   * changes rendering; it is kept so existing call sites stay type-compatible.
   */
  accent?: boolean;
};

/**
 * Connections tab row. Thin wrapper over the shared `Tabs` primitive, which
 * provides `role="tablist"` semantics, roving-tabindex + arrow-key navigation,
 * and count badges — none of which the previous hand-rolled pill row had.
 */
export function ConnectionsTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: ConnectionsTab[];
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <Tabs
      className={styles.tabsRow}
      variant="underline"
      active={active}
      onChange={(id) => onSelect(id as TabId)}
      tabs={tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
        count: tab.count,
      }))}
    />
  );
}
