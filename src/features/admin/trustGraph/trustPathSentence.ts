import type { TrustGraph } from "./trustGraphModel";
import type { TrustPath, TrustPathStep } from "./trustPath";

/** The slice of i18next's `t` these pure builders need. */
export type Translate = (
  key: string,
  values?: Record<string, string | number>,
) => string;

function stepKeySuffix(step: TrustPathStep): string {
  return step.isForward ? step.kind : `${step.kind}Backward`;
}

/** B8: "Ana vouched for Rui, who invited Lemon". The first clause names both
 *  ends, every later clause names only the next member. Undirected paths get
 *  the "Undirected path:" wrapper. */
export function describeTrustPath(
  path: TrustPath,
  graph: TrustGraph,
  t: Translate,
): string {
  const nameOf = (personId: string): string =>
    graph.peopleById[personId]?.name ?? personId;

  if (path.steps.length === 0) {
    const onlyId = path.nodeIds[0];
    return onlyId ? nameOf(onlyId) : "";
  }

  const clauses = path.steps.map((step, stepIndex) => {
    const suffix = stepKeySuffix(step);
    if (stepIndex === 0) {
      return t(`admin:vouchGraph.path.first.${suffix}`, {
        from: nameOf(step.fromId),
        to: nameOf(step.toId),
      });
    }
    return t(`admin:vouchGraph.path.next.${suffix}`, {
      to: nameOf(step.toId),
    });
  });
  const sentence = clauses.join(", ");

  return path.isDirected
    ? sentence
    : t("admin:vouchGraph.path.undirected", { sentence });
}
