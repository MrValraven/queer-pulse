import {
  memo,
  useId,
  useSyncExternalStore,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { FiChevronRight, FiTarget } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Collapse } from "../../shared/components/ui/Collapse";
import { AdminAvatar } from "./ui";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { monthDate, type VouchPerson } from "./trustGraph/trustGraphModel";
import type {
  InviteTreeNode,
  InviteTreeStore,
  InviteTreeViewState,
} from "./buildInviteTree";
import styles from "./vouchGraphInviteTree.module.css";

/** Stable handles every row shares. The object keeps its identity while the
 *  tab stop moves or branches fold, so memoised rows skip those renders. */
export interface InviteTreeActions {
  store: InviteTreeStore;
  onToggle: (itemId: string) => void;
  onItemClick: (event: MouseEvent<HTMLLIElement>, itemId: string) => void;
  onItemKeyDown: (event: KeyboardEvent<HTMLLIElement>, itemId: string) => void;
  onShowInNetwork: (personId: string) => void;
  /** One shared month formatter for the active locale. */
  formatMonth: (date: Date) => string;
}

/** Subscribes to one boolean of the tree's view state. */
function useTreeFlag(
  store: InviteTreeStore,
  select: (state: InviteTreeViewState) => boolean,
): boolean {
  return useSyncExternalStore(store.subscribe, () => select(store.getState()));
}

/** The join month: the full ISO time when it reads, else the 'YYYY-MM'. */
function joinedMonthDate(person: VouchPerson): Date {
  const joinedAt = new Date(person.joinedAt);
  return Number.isNaN(joinedAt.getTime()) ? monthDate(person.joined) : joinedAt;
}

/** The meta line: join month, "invited N" and the compact track record. */
function InviteTreeRowMeta({
  id,
  person,
  invitedCount,
  formatMonth,
}: {
  id: string;
  person: VouchPerson;
  invitedCount: number;
  formatMonth: (date: Date) => string;
}) {
  const { t } = useTranslation();
  const { vouchesGiven, laterFlaggedCount } = person.trackRecord;
  return (
    <span id={id} className={styles.meta}>
      <span className={styles.metaPart}>
        {formatMonth(joinedMonthDate(person))}
      </span>
      {invitedCount > 0 && (
        <span className={styles.metaPart}>
          {t("admin:vouchGraph.inviteTree.invitedCount", {
            count: invitedCount,
          })}
        </span>
      )}
      {vouchesGiven > 0 && (
        <span
          className={styles.metaPart}
          data-tone={laterFlaggedCount > 0 ? "warn" : "clean"}
        >
          {t("admin:vouchGraph.inspector.trackRecord.compact", {
            flagged: laterFlaggedCount,
            given: vouchesGiven,
          })}
        </span>
      )}
    </span>
  );
}

export interface VouchGraphInviteTreeRowProps {
  node: InviteTreeNode;
  level: number;
  actions: InviteTreeActions;
}

/** One member in the invite tree, with their invitees nested below. */
export const VouchGraphInviteTreeRow = memo(function VouchGraphInviteTreeRow({
  node,
  level,
  actions,
}: VouchGraphInviteTreeRowProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const baseId = useId();
  const { store } = actions;
  const personId = node.personId;
  const isExpandable = node.children.length > 0;
  const isOpen = useTreeFlag(store, (state) => state.expandedIds.has(personId));
  const isSelected = useTreeFlag(
    store,
    (state) => state.selectedId === personId,
  );
  const isTabStop = useTreeFlag(store, (state) => state.activeId === personId);
  const isFocus = useTreeFlag(store, (state) => state.focusId === personId);
  const person = graph.peopleById[personId];
  if (!person) return null;
  const isExpanded = isExpandable && isOpen;
  const nameId = `${baseId}-name`;
  const standingId = `${baseId}-standing`;
  const metaId = `${baseId}-meta`;
  const rowClassName = [
    styles.row,
    isFocus ? styles.rowFocus : "",
    isSelected ? styles.rowSelected : "",
  ]
    .filter(Boolean)
    .join(" ");
  const toggleLabel = isExpanded
    ? t("admin:vouchGraph.inviteTree.collapseAria", { name: person.name })
    : t("admin:vouchGraph.inviteTree.expandAria", {
        count: node.invitedCount,
        name: person.name,
      });

  return (
    <li
      role="treeitem"
      aria-level={level}
      aria-expanded={isExpandable ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-labelledby={`${nameId} ${standingId}`}
      aria-describedby={metaId}
      tabIndex={isTabStop ? 0 : -1}
      data-tree-item-id={personId}
      className={styles.item}
      onClick={(event) => actions.onItemClick(event, personId)}
      onKeyDown={(event) => actions.onItemKeyDown(event, personId)}
    >
      <div className={rowClassName}>
        {isExpandable ? (
          <button
            type="button"
            className={styles.toggle}
            aria-label={toggleLabel}
            tabIndex={-1}
            data-expanded={isExpanded}
            onClick={(event) => {
              event.stopPropagation();
              actions.onToggle(personId);
            }}
          >
            <FiChevronRight aria-hidden />
          </button>
        ) : (
          <span className={styles.toggleSpacer} aria-hidden />
        )}
        <AdminAvatar
          initials={person.initials}
          tone={person.tone}
          size="sm"
          src={person.avatarUrl ?? undefined}
          alt=""
        />
        <span className={styles.text}>
          <span className={styles.nameLine}>
            <span id={nameId} className={styles.name}>
              {person.name}
            </span>
            <span
              className={styles.standingDot}
              data-standing={person.standing}
              aria-hidden
            />
            <span id={standingId} className={styles.visuallyHidden}>
              {t(`admin:vouchGraph.filters.standing.${person.standing}`)}
            </span>
          </span>
          <InviteTreeRowMeta
            id={metaId}
            person={person}
            invitedCount={node.invitedCount}
            formatMonth={actions.formatMonth}
          />
        </span>
        <button
          type="button"
          className={styles.showInNetwork}
          tabIndex={isTabStop ? 0 : -1}
          onClick={(event) => {
            event.stopPropagation();
            actions.onShowInNetwork(personId);
          }}
        >
          <FiTarget aria-hidden />
          <span>{t("admin:vouchGraph.inviteTree.showInNetworkCta")}</span>
        </button>
      </div>
      {isExpandable && (
        <Collapse isOpen={isExpanded}>
          <ul role="group" className={styles.group}>
            {node.children.map((child) => (
              <VouchGraphInviteTreeRow
                key={child.personId}
                node={child}
                level={level + 1}
                actions={actions}
              />
            ))}
          </ul>
        </Collapse>
      )}
    </li>
  );
});
