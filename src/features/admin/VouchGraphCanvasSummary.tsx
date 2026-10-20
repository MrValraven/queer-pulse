import { useMemo, useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { groupEgoRelations } from "./trustGraph/egoRelation";
import type { VouchEdge } from "./trustGraph/trustGraphModel";
import type { TrustPath } from "./trustGraph/trustPath";
import { describeTrustPath } from "./trustGraph/trustPathSentence";

interface VouchGraphCanvasSummaryProps {
  id: string;
  focusId: string;
  visIds: string[];
  visEdges: VouchEdge[];
  path: TrustPath | null;
  /** While true the previous text stays; the new one is announced after. */
  isReplaying?: boolean;
}

/** E1: the live summary the canvas `aria-describedby` points at. */
export function VouchGraphCanvasSummary({
  id,
  focusId,
  visIds,
  visEdges,
  path,
  isReplaying = false,
}: VouchGraphCanvasSummaryProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const focusName = graph.peopleById[focusId]?.name ?? focusId;

  const summary = useMemo(() => {
    const people = visIds.flatMap((personId) => {
      const person = graph.peopleById[personId];
      return person ? [person] : [];
    });
    const relations = groupEgoRelations(graph, focusId, visIds, visEdges);
    const relationCounts = {
      mutual: 0,
      vouchedBy: 0,
      vouchedFor: 0,
      invited: 0,
    };
    for (const relation of relations.values()) {
      if (relation in relationCounts) {
        relationCounts[relation as keyof typeof relationCounts] += 1;
      }
    }
    const flaggedCount = people.filter(
      (person) =>
        person.inRing ||
        person.ringId ||
        graph.isIsolated(person.id) ||
        (person.reports ?? 0) > 0,
    ).length;
    return { peopleCount: people.length, relationCounts, flaggedCount };
  }, [graph, focusId, visIds, visEdges]);

  const parts = [
    t("admin:vouchGraph.summary.people", {
      name: focusName,
      count: summary.peopleCount,
    }),
    t("admin:vouchGraph.summary.relations", {
      name: focusName,
      ...summary.relationCounts,
    }),
  ];
  if (summary.flaggedCount > 0) {
    parts.push(
      t("admin:vouchGraph.summary.cases", { count: summary.flaggedCount }),
    );
  }
  if (path) {
    parts.push(
      t("admin:vouchGraph.summary.path", {
        sentence: describeTrustPath(path, graph, t),
      }),
    );
  }

  const currentText = parts.join(" ");
  const [announcedText, setAnnouncedText] = useState(currentText);
  if (!isReplaying && announcedText !== currentText) {
    setAnnouncedText(currentText);
  }

  return (
    <p id={id} className="visuallyHidden" aria-live="polite">
      {announcedText}
    </p>
  );
}
