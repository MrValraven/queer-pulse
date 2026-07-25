import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTrustGraph, type TrustGraph, type TrustGraphData } from "./trustGraphModel";

const TrustGraphCtx = createContext<TrustGraph | null>(null);

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

export function useTrustGraph(): TrustGraph {
  const graph = useContext(TrustGraphCtx);
  if (!graph) {
    throw new Error("useTrustGraph must be used within a TrustGraphProvider");
  }
  return graph;
}
