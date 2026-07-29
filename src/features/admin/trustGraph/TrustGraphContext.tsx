import { useMemo, type ReactNode } from "react";
import { createTrustGraph, type TrustGraphData } from "./trustGraphModel";
import { TrustGraphCtx } from "./useTrustGraph";

export function TrustGraphProvider({
  data,
  children,
}: {
  data: TrustGraphData;
  children: ReactNode;
}) {
  const graph = useMemo(() => createTrustGraph(data), [data]);
  return <TrustGraphCtx.Provider value={graph}>{children}</TrustGraphCtx.Provider>;
}
