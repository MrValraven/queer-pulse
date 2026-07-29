import { createContext, useContext } from "react";
import { type TrustGraph } from "./trustGraphModel";

export const TrustGraphCtx = createContext<TrustGraph | null>(null);

export function useTrustGraph(): TrustGraph {
  const graph = useContext(TrustGraphCtx);
  if (!graph) {
    throw new Error("useTrustGraph must be used within a TrustGraphProvider");
  }
  return graph;
}
