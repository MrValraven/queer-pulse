import { createContext, useContext } from "react";
import { type NudgeKey } from "../../shared/api/nudges.api";

export interface NudgesValue {
  /** Has this discovery moment already been dismissed (this member, any device)? */
  isDismissed: (key: NudgeKey) => boolean;
  /** True once ≥ 2 distinct nudges have been dismissed — the rest stop firing. */
  isCapped: boolean;
  /** Optimistic: marks `key` dismissed locally instantly, POSTs in the background. */
  dismiss: (key: NudgeKey) => void;
}

export const NudgesContext = createContext<NudgesValue | null>(null);

export function useNudges(): NudgesValue {
  const ctx = useContext(NudgesContext);
  if (!ctx) throw new Error("useNudges must be used within NudgesProvider");
  return ctx;
}
