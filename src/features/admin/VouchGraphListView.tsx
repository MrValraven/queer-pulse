import { useMemo, useState } from "react";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { groupEgoRelations } from "./trustGraph/egoRelation";
import {
  monthDate,
  type TrustGraph,
  type VouchEdge,
  type VouchPerson,
} from "./trustGraph/trustGraphModel";
import type { InviteBubble } from "./vouchGraph.types";
import styles from "./vouchGraphListView.module.css";

interface VouchGraphListViewProps {
  focusId: string;
  visIds: string[];
  visEdges: VouchEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Invite bubbles; each collapsed one gets a row that expands it. */
  bubbles?: InviteBubble[];
  onToggleBubble?: (parentId: string) => void;
}

function flagKeysFor(person: VouchPerson, graph: TrustGraph): string[] {
  const flagKeys: string[] = [];
  if (person.inRing || person.ringId) flagKeys.push("ring");
  if (graph.isIsolated(person.id)) flagKeys.push("isolated");
  if ((person.reports ?? 0) > 0) flagKeys.push("reported");
  return flagKeys;
}

/** E1: the visible members as a table, for screen readers and keyboards. */
export function VouchGraphListView({
  focusId,
  visIds,
  visEdges,
  selectedId,
  onSelect,
  bubbles,
  onToggleBubble,
}: VouchGraphListViewProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const graph = useTrustGraph();
  const [isSortedByName, setIsSortedByName] = useState(false);
  const [isSortAscending, setIsSortAscending] = useState(true);
  const focusName = graph.peopleById[focusId]?.name ?? focusId;

  const relations = useMemo(
    () => groupEgoRelations(graph, focusId, visIds, visEdges),
    [graph, focusId, visIds, visEdges],
  );
  const rows = useMemo(() => {
    const people = visIds.flatMap((personId) => {
      const person = graph.peopleById[personId];
      return person ? [person] : [];
    });
    if (!isSortedByName) return people;
    const direction = isSortAscending ? 1 : -1;
    return [...people].sort(
      (first, second) =>
        direction *
        first.name.localeCompare(second.name, undefined, {
          sensitivity: "base",
        }),
    );
  }, [graph, visIds, isSortedByName, isSortAscending]);

  function toggleNameSort() {
    if (!isSortedByName) {
      setIsSortedByName(true);
      setIsSortAscending(true);
    } else {
      setIsSortAscending((isAscending) => !isAscending);
    }
  }

  const collapsedBubbles = (bubbles ?? []).filter(
    (bubble) => !bubble.isExpanded,
  );

  const SortIcon = isSortAscending ? FiArrowUp : FiArrowDown;
  const nameSortState = !isSortedByName
    ? "none"
    : isSortAscending
      ? "ascending"
      : "descending";

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          {t("admin:vouchGraph.listView.caption", { name: focusName })}
        </caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={nameSortState}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={toggleNameSort}
              >
                {t("admin:vouchGraph.listView.col.name")}
                {isSortedByName && <SortIcon aria-hidden />}
                <span className="visuallyHidden">
                  {t("admin:vouchGraph.listView.sortByNameCta")}
                </span>
              </button>
            </th>
            <th scope="col">{t("admin:vouchGraph.listView.col.relation")}</th>
            <th scope="col">{t("admin:vouchGraph.listView.col.standing")}</th>
            <th scope="col">{t("admin:vouchGraph.listView.col.joined")}</th>
            <th scope="col">{t("admin:vouchGraph.listView.col.flags")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((person) => {
            const relation =
              person.id === focusId ? "focus" : relations.get(person.id);
            return (
              <tr
                key={person.id}
                className={person.id === selectedId ? styles.isSelected : ""}
              >
                <th scope="row">
                  <button
                    type="button"
                    className={styles.rowButton}
                    aria-label={t("admin:vouchGraph.listView.selectAria", {
                      name: person.name,
                    })}
                    aria-current={person.id === selectedId || undefined}
                    onClick={() => onSelect(person.id)}
                  >
                    {person.name}
                  </button>
                </th>
                <td>
                  {relation
                    ? t(`admin:vouchGraph.listView.relation.${relation}`, {
                        name: focusName,
                      })
                    : ""}
                </td>
                <td>
                  {t(`admin:vouchGraph.filters.standing.${person.standing}`)}
                </td>
                <td>
                  {fmt.date(monthDate(person.joined), {
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>
                  {flagKeysFor(person, graph)
                    .map((flagKey) =>
                      t(`admin:vouchGraph.legend.safety.${flagKey}`),
                    )
                    .join(", ")}
                </td>
              </tr>
            );
          })}
          {onToggleBubble &&
            collapsedBubbles.map((bubble) => (
              <tr key={bubble.id}>
                <td colSpan={5}>
                  <button
                    type="button"
                    className={styles.rowButton}
                    onClick={() => onToggleBubble(bubble.parentId)}
                  >
                    {t("admin:vouchGraph.canvas.bubbleAria", {
                      count: bubble.leafIds.length,
                      name: graph.peopleById[bubble.parentId]?.name ?? "",
                    })}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
