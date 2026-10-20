import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FiSearch } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { VouchGraphConnectionRow } from "./VouchGraphConnectionRow";
import {
  CONNECTION_TABS,
  countVisibleInbound,
  useVouchConnectionList,
  type ConnectionRow,
  type ConnectionSort,
  type ConnectionTab,
} from "./useVouchConnectionList";
import styles from "./vouchGraphConnections.module.css";

const VIRTUALIZE_ABOVE_ROWS = 40;
const ESTIMATED_ROW_HEIGHT = 60;
const SORT_OPTIONS: ConnectionSort[] = ["name", "newest", "oldest"];

export interface VouchGraphConnectionTabsProps {
  personId: string;
  activeEdgeId: string | null;
  hoveredId: string | null;
  shouldHideWithdrawn: boolean;
  onHoverChange: (id: string | null) => void;
  onGo: (id: string) => void;
}

interface RowListProps {
  rows: ConnectionRow[];
  personId: string;
  tab: ConnectionTab;
  activeEdgeId: string | null;
  hoveredId: string | null;
  listHoveredIdRef: RefObject<string | null>;
  onHoverChange: (id: string | null) => void;
  onGo: (id: string) => void;
}

function renderRow(props: RowListProps, row: ConnectionRow) {
  return (
    <VouchGraphConnectionRow
      key={row.edge.id}
      row={row}
      personId={props.personId}
      tab={props.tab}
      isActive={row.edge.id === props.activeEdgeId}
      isHovered={row.otherId === props.hoveredId}
      onHoverChange={(id) => {
        props.listHoveredIdRef.current = id;
        props.onHoverChange(id);
      }}
      onGo={props.onGo}
    />
  );
}

function PlainRowList(props: RowListProps) {
  return (
    <div className={styles.list}>
      {props.rows.map((row) => renderRow(props, row))}
    </div>
  );
}

function VirtualRowList(props: RowListProps) {
  "use no memo";
  const scrollRef = useRef<HTMLDivElement>(null);
  const { rows, hoveredId, listHoveredIdRef } = props;
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    getItemKey: (index) => rows[index]?.edge.id ?? index,
    overscan: 6,
  });
  useEffect(() => {
    if (!hoveredId || hoveredId === listHoveredIdRef.current) return;
    const rowIndex = rows.findIndex((row) => row.otherId === hoveredId);
    if (rowIndex >= 0) virtualizer.scrollToIndex(rowIndex, { align: "auto" });
  }, [hoveredId, listHoveredIdRef, rows, virtualizer]);
  return (
    <div ref={scrollRef} className={`${styles.list} ${styles.listScroll}`}>
      <div
        className={styles.virtualCanvas}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          const row = rows[item.index];
          if (!row) return null;
          return (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              className={styles.virtualRow}
              style={{ transform: `translateY(${item.start}px)` }}
            >
              {renderRow(props, row)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConnectionControls(props: {
  query: string;
  sort: ConnectionSort;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: ConnectionSort) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.controls}>
      <label className={styles.search}>
        <FiSearch aria-hidden className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          value={props.query}
          placeholder={t("admin:vouchGraph.inspector.list.searchPlaceholder")}
          aria-label={t("admin:vouchGraph.inspector.list.searchAriaLabel")}
          data-escape-clears
          onChange={(event) => props.onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            // Escape clears a typed filter first; once the field is empty
            // it passes on to close the sheet or the graph. The attribute
            // tells the phone sheet's Escape listener to wait for this.
            if (event.key !== "Escape" || props.query === "") return;
            event.preventDefault();
            event.stopPropagation();
            props.onQueryChange("");
          }}
        />
      </label>
      <select
        className={styles.sortSelect}
        value={props.sort}
        aria-label={t("admin:vouchGraph.inspector.list.sortLabel")}
        onChange={(event) =>
          props.onSortChange(event.target.value as ConnectionSort)
        }
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`admin:vouchGraph.inspector.list.sort.${option}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

function moveTabFocus(
  event: ReactKeyboardEvent<HTMLButtonElement>,
  currentIndex: number,
  onSelect: (tab: ConnectionTab) => void,
) {
  const lastIndex = CONNECTION_TABS.length - 1;
  const nextIndex =
    event.key === "ArrowRight"
      ? (currentIndex + 1) % CONNECTION_TABS.length
      : event.key === "ArrowLeft"
        ? (currentIndex + lastIndex) % CONNECTION_TABS.length
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? lastIndex
            : -1;
  if (nextIndex < 0) return;
  event.preventDefault();
  onSelect(CONNECTION_TABS[nextIndex]!);
  const tabButtons =
    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
      '[role="tab"]',
    );
  tabButtons?.[nextIndex]?.focus();
}

/** Slides the underline under the selected tab. Tabs size to their labels,
 *  so it reads the button's box and moves by transform (offset plus a
 *  scaleX on a 1px bar). The first placement skips the transition, and a
 *  ResizeObserver keeps it aligned as widths change (fonts, counts,
 *  resizes). */
function useTabIndicator(tab: ConnectionTab) {
  const tabListRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const hasPlacedRef = useRef(false);
  useLayoutEffect(() => {
    const tabList = tabListRef.current;
    const indicator = indicatorRef.current;
    if (!tabList || !indicator) return;
    const place = () => {
      const activeButton = tabList.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]',
      );
      if (!activeButton) return;
      const transform = `translateX(${activeButton.offsetLeft}px) scaleX(${activeButton.offsetWidth})`;
      if (hasPlacedRef.current) {
        indicator.style.transform = transform;
        return;
      }
      indicator.style.transition = "none";
      indicator.style.transform = transform;
      void indicator.offsetWidth;
      indicator.style.transition = "";
      hasPlacedRef.current = true;
    };
    place();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(tabList);
    tabList
      .querySelectorAll('[role="tab"]')
      .forEach((tabButton) => observer.observe(tabButton));
    return () => observer.disconnect();
  }, [tab]);
  return { tabListRef, indicatorRef };
}

/** Keyed on the member, so tab, filter and sort start fresh for each one. */
export function VouchGraphConnectionTabs(props: VouchGraphConnectionTabsProps) {
  return <ConnectionTabsBody key={props.personId} {...props} />;
}

function ConnectionTabsBody({
  personId,
  activeEdgeId,
  hoveredId,
  shouldHideWithdrawn,
  onHoverChange,
  onGo,
}: VouchGraphConnectionTabsProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const idBase = useId();
  const listHoveredIdRef = useRef<string | null>(null);
  const [shownOutsideCount, setShownOutsideCount] = useState(0);
  const list = useVouchConnectionList({ graph, personId, shouldHideWithdrawn });
  const { tab, query, rows, counts } = list;
  const person = graph.peopleById[personId];
  const hiddenInboundCount =
    tab === "vouchedBy" && person
      ? person.activeInboundCount - countVisibleInbound(graph, personId)
      : 0;
  // Keep the last non-zero count so the footnote reads right while it folds away.
  if (hiddenInboundCount > 0 && hiddenInboundCount !== shownOutsideCount) {
    setShownOutsideCount(hiddenInboundCount);
  }
  const rowListProps: RowListProps = {
    rows,
    personId,
    tab,
    activeEdgeId,
    hoveredId,
    listHoveredIdRef,
    onHoverChange,
    onGo,
  };
  const { tabListRef, indicatorRef } = useTabIndicator(tab);
  return (
    <section className={styles.tabs}>
      <div
        ref={tabListRef}
        className={styles.tabList}
        role="tablist"
        aria-label={t("admin:vouchGraph.inspector.tabs.ariaLabel")}
      >
        {CONNECTION_TABS.map((tabId, tabIndex) => (
          <button
            key={tabId}
            type="button"
            role="tab"
            id={`${idBase}-tab-${tabId}`}
            aria-selected={tabId === tab}
            aria-controls={`${idBase}-panel`}
            tabIndex={tabId === tab ? 0 : -1}
            className={styles.tabButton}
            onClick={() => list.setTab(tabId)}
            onKeyDown={(event) => moveTabFocus(event, tabIndex, list.setTab)}
          >
            {/* The label may ellipsize on a narrow rail; the count never does. */}
            <span className={styles.tabLabel}>
              {t(`admin:vouchGraph.inspector.tabs.${tabId}Label`)}
            </span>{" "}
            <span className={styles.tabCount}>{counts[tabId]}</span>
          </button>
        ))}
        <span ref={indicatorRef} aria-hidden className={styles.tabIndicator} />
      </div>
      <ConnectionControls
        query={query}
        sort={list.sort}
        onQueryChange={list.setQuery}
        onSortChange={list.setSort}
      />
      <div
        key={tab}
        id={`${idBase}-panel`}
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`${idBase}-tab-${tab}`}
        className={styles.panel}
      >
        {rows.length === 0 ? (
          <p className={styles.empty}>
            {query.trim() !== ""
              ? t("admin:vouchGraph.inspector.list.noMatches")
              : t("admin:vouchGraph.inspector.none")}
          </p>
        ) : rows.length > VIRTUALIZE_ABOVE_ROWS ? (
          <VirtualRowList {...rowListProps} />
        ) : (
          <PlainRowList {...rowListProps} />
        )}
        <Collapse isOpen={hiddenInboundCount > 0}>
          <p className={styles.footnote}>
            {t("admin:vouchGraph.inspector.list.outsideView", {
              count: shownOutsideCount,
            })}
          </p>
        </Collapse>
      </div>
    </section>
  );
}
