import {
  memo,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { intlLocale } from "../../shared/i18n/locale";
import type { Language } from "../../shared/i18n/types";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import {
  INVITE_TREE_GROUPS,
  buildInviteTree,
  createInviteTreeStore,
  expandPathTo,
  groupOfPerson,
  inviteTreeGroupItemId,
  listVisibleTreeItems,
  pathToPerson,
  toggleExpanded,
  type InviteTreeGroup,
  type InviteTreeRoot,
  type InviteTreeStore,
  type InviteTreeViewState,
  type InviteTreeVisibleItem,
} from "./buildInviteTree";
import {
  VouchGraphInviteTreeRow,
  type InviteTreeActions,
} from "./VouchGraphInviteTreeRow";
import styles from "./vouchGraphInviteTree.module.css";

const GROUP_LABEL_KEYS: Record<InviteTreeGroup, string> = {
  founders: "admin:vouchGraph.inviteTree.groupFounders",
  outside: "admin:vouchGraph.inviteTree.groupOutside",
  applications: "admin:vouchGraph.inviteTree.groupApplications",
  unknown: "admin:vouchGraph.inviteTree.groupUnknown",
};

const GROUP_ITEM_IDS = new Set(INVITE_TREE_GROUPS.map(inviteTreeGroupItemId));

/** The shared Collapse opens over 280 ms; one more frame lets heights settle. */
const COLLAPSE_SETTLE_MS = 300;

/** The closest item still on screen for a hidden `activeId`: its nearest
 *  open ancestor, then its group, then the first row. */
function nearestVisibleItemId(
  roots: InviteTreeRoot[],
  visibleItems: InviteTreeVisibleItem[],
  activeId: string,
): string | undefined {
  const visibleIds = new Set(visibleItems.map((item) => item.id));
  const group = groupOfPerson(roots, activeId);
  const candidateIds = [
    ...pathToPerson(roots, activeId).reverse(),
    ...(group ? [inviteTreeGroupItemId(group)] : []),
  ];
  return (
    candidateIds.find((candidateId) => visibleIds.has(candidateId)) ??
    visibleItems[0]?.id
  );
}

/** Moves the panel's own scrollTop so `row` sits in view; the modal around
 *  the panel never scrolls. */
function scrollRowIntoPanel(panel: HTMLElement, row: Element): void {
  const rowRect = row.getBoundingClientRect();
  const rowTop =
    rowRect.top - panel.getBoundingClientRect().top + panel.scrollTop;
  const isInView =
    rowTop >= panel.scrollTop &&
    rowTop + rowRect.height <= panel.scrollTop + panel.clientHeight;
  if (!isInView) {
    panel.scrollTop = Math.max(0, rowTop - panel.clientHeight / 3);
  }
}

/** True when the event started inside this item and outside its sub-items. */
function isOwnTreeItemEvent(
  event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>,
): boolean {
  const target = event.target as HTMLElement;
  return target.closest('[role="treeitem"]') === event.currentTarget;
}

function findTreeItem(
  treeRef: RefObject<HTMLUListElement | null>,
  itemId: string,
): HTMLElement | null {
  return (
    treeRef.current?.querySelector<HTMLElement>(
      `[data-tree-item-id="${CSS.escape(itemId)}"]`,
    ) ?? null
  );
}

/** Every group open, plus the path to the focus (its invitees included) and
 *  the path to the selected member. */
function initialViewState(
  roots: InviteTreeRoot[],
  focusId: string,
  selectedId: string | null,
): InviteTreeViewState {
  const groupIds = new Set(
    roots.map((root) => inviteTreeGroupItemId(root.group)),
  );
  const withFocus = expandPathTo(roots, groupIds, focusId, true);
  const expandedIds = selectedId
    ? expandPathTo(roots, withFocus, selectedId, false)
    : withFocus;
  return { focusId, selectedId, activeId: focusId, expandedIds };
}

interface LatestTreeInput {
  roots: InviteTreeRoot[];
  onSelect: (id: string) => void;
  onShowInNetwork: (id: string) => void;
}

/** Stable row handlers. They read the latest roots and callbacks through a
 *  ref, so the returned object changes only with the store or the locale. */
function useInviteTreeActions(
  store: InviteTreeStore,
  treeRef: RefObject<HTMLUListElement | null>,
  latest: RefObject<LatestTreeInput>,
  language: Language,
): InviteTreeActions {
  return useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(intlLocale(language), {
      month: "short",
      year: "numeric",
    });
    const toggle = (itemId: string) =>
      store.update((current) => ({
        ...current,
        expandedIds: toggleExpanded(current.expandedIds, itemId),
      }));
    const moveTo = (itemId: string | null | undefined) => {
      if (!itemId) return;
      store.update((current) => ({ ...current, activeId: itemId }));
      findTreeItem(treeRef, itemId)?.focus();
    };
    const activate = (itemId: string) => {
      if (GROUP_ITEM_IDS.has(itemId)) toggle(itemId);
      else latest.current.onSelect(itemId);
    };
    const handleKey = (event: KeyboardEvent<HTMLLIElement>, itemId: string) => {
      const { expandedIds } = store.getState();
      const items = listVisibleTreeItems(latest.current.roots, expandedIds);
      const itemIndex = items.findIndex((item) => item.id === itemId);
      const item = items[itemIndex];
      if (!item) return false;
      const isExpanded = expandedIds.has(itemId);
      if (event.key === "ArrowDown") moveTo(items[itemIndex + 1]?.id);
      else if (event.key === "ArrowUp") moveTo(items[itemIndex - 1]?.id);
      else if (event.key === "Home") moveTo(items[0]?.id);
      else if (event.key === "End") moveTo(items[items.length - 1]?.id);
      else if (event.key === "ArrowRight") {
        if (item.isExpandable && isExpanded) moveTo(items[itemIndex + 1]?.id);
        else if (item.isExpandable) toggle(itemId);
      } else if (event.key === "ArrowLeft") {
        if (item.isExpandable && isExpanded) toggle(itemId);
        else moveTo(item.parentId);
      } else if (event.key === "Enter" || event.key === " ") {
        if (event.target !== event.currentTarget) return false;
        activate(itemId);
      } else return false;
      return true;
    };
    return {
      store,
      onToggle: toggle,
      onItemClick: (event, itemId) => {
        if (!isOwnTreeItemEvent(event)) return;
        store.update((current) => ({ ...current, activeId: itemId }));
        activate(itemId);
      },
      onItemKeyDown: (event, itemId) => {
        if (isOwnTreeItemEvent(event) && handleKey(event, itemId)) {
          event.preventDefault();
        }
      },
      onShowInNetwork: (personId) => latest.current.onShowInNetwork(personId),
      formatMonth: (date) => monthFormatter.format(date),
    };
  }, [store, treeRef, latest, language]);
}

/** One root group: a level-1 heading that folds its members. */
const InviteTreeGroupItem = memo(function InviteTreeGroupItem({
  root,
  actions,
}: {
  root: InviteTreeRoot;
  actions: InviteTreeActions;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const { store } = actions;
  const itemId = inviteTreeGroupItemId(root.group);
  const isExpanded = useSyncExternalStore(store.subscribe, () =>
    store.getState().expandedIds.has(itemId),
  );
  const isTabStop = useSyncExternalStore(
    store.subscribe,
    () => store.getState().activeId === itemId,
  );
  return (
    <li
      role="treeitem"
      aria-level={1}
      aria-expanded={isExpanded}
      aria-selected={false}
      aria-labelledby={labelId}
      tabIndex={isTabStop ? 0 : -1}
      data-tree-item-id={itemId}
      className={styles.item}
      onClick={(event) => actions.onItemClick(event, itemId)}
      onKeyDown={(event) => actions.onItemKeyDown(event, itemId)}
    >
      <div className={styles.groupRow}>
        <span className={styles.toggle} data-expanded={isExpanded} aria-hidden>
          <FiChevronRight />
        </span>
        <span id={labelId} className={styles.groupLabel}>
          {t(GROUP_LABEL_KEYS[root.group])}
        </span>
        <span className={styles.groupCount}>{root.nodes.length}</span>
      </div>
      <Collapse isOpen={isExpanded}>
        <ul role="group" className={styles.rootList}>
          {root.nodes.map((node) => (
            <VouchGraphInviteTreeRow
              key={node.personId}
              node={node}
              level={2}
              actions={actions}
            />
          ))}
        </ul>
      </Collapse>
    </li>
  );
});

export interface VouchGraphInviteTreeProps {
  focusId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onShowInNetwork: (id: string) => void;
}

/** B4: who invited whom, as an indented, collapsible outline (an ARIA tree).
 *  It covers every loaded member and ignores the filters. */
export function VouchGraphInviteTree({
  focusId,
  selectedId,
  onSelect,
  onShowInNetwork,
}: VouchGraphInviteTreeProps) {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const graph = useTrustGraph();
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const treeRef = useRef<HTMLUListElement>(null);
  const roots = useMemo(() => buildInviteTree(graph), [graph]);
  const [store] = useState(() =>
    createInviteTreeStore(initialViewState(roots, focusId, selectedId)),
  );
  const viewState = useSyncExternalStore(store.subscribe, store.getState);
  const latest = useRef<LatestTreeInput>({ roots, onSelect, onShowInNetwork });
  useLayoutEffect(() => {
    latest.current = { roots, onSelect, onShowInNetwork };
  });
  const actions = useInviteTreeActions(store, treeRef, latest, language);

  // Expansion rule: a new graph or a new focus opens the path to the focus
  // and the focus's own invitees. A new selection opens only the path to the
  // selected member, so a click never re-opens a branch the admin folded.
  useLayoutEffect(() => {
    store.update((current) => {
      const expandedIds = expandPathTo(
        roots,
        current.expandedIds,
        focusId,
        true,
      );
      const isUnchanged =
        expandedIds === current.expandedIds && current.focusId === focusId;
      return isUnchanged ? current : { ...current, focusId, expandedIds };
    });
  }, [store, roots, focusId]);
  useLayoutEffect(() => {
    store.update((current) => {
      const expandedIds = selectedId
        ? expandPathTo(roots, current.expandedIds, selectedId, false)
        : current.expandedIds;
      const isUnchanged =
        expandedIds === current.expandedIds &&
        current.selectedId === selectedId;
      return isUnchanged ? current : { ...current, selectedId, expandedIds };
    });
  }, [store, roots, selectedId]);

  // Keep one item in the tab order when a fold hides the active one: the
  // nearest visible ancestor takes the tab stop.
  const visibleItems = useMemo(
    () => listVisibleTreeItems(roots, viewState.expandedIds),
    [roots, viewState.expandedIds],
  );
  useLayoutEffect(() => {
    if (visibleItems.some((item) => item.id === viewState.activeId)) return;
    const fallbackId = nearestVisibleItemId(
      roots,
      visibleItems,
      viewState.activeId,
    );
    if (fallbackId) {
      store.update((current) => ({ ...current, activeId: fallbackId }));
    }
  }, [store, roots, visibleItems, viewState.activeId]);

  // Bring the focus row into the panel now, and again once any branch that
  // just opened has finished its Collapse animation (heights grow from 0).
  useEffect(() => {
    const scrollToFocus = () => {
      const panel = panelRef.current;
      const focusRow = findTreeItem(treeRef, focusId)?.firstElementChild;
      if (panel && focusRow) scrollRowIntoPanel(panel, focusRow);
    };
    scrollToFocus();
    if (reducedMotion) return;
    const settleTimer = window.setTimeout(scrollToFocus, COLLAPSE_SETTLE_MS);
    return () => window.clearTimeout(settleTimer);
  }, [focusId, reducedMotion]);

  const hasInvites = graph.people.some(
    (person) => person.joinPath.kind === "invite",
  );

  return (
    <section ref={panelRef} className={styles.panel} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.title}>
        {t("admin:vouchGraph.inviteTree.title")}
      </h3>
      <Collapse isOpen={!hasInvites}>
        <p className={styles.empty}>{t("admin:vouchGraph.inviteTree.empty")}</p>
      </Collapse>
      <ul
        ref={treeRef}
        role="tree"
        aria-labelledby={titleId}
        className={styles.tree}
      >
        {roots.map((root) => (
          <InviteTreeGroupItem key={root.group} root={root} actions={actions} />
        ))}
      </ul>
    </section>
  );
}
