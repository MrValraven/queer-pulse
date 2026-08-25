import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  RoadmapModalsContext,
  type RoadmapModalName,
  type RoadmapModalPayload,
  type RoadmapModalsContextValue,
} from "./roadmapModalsContext";

export function RoadmapModalsProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<RoadmapModalName | null>(null);
  const [payload, setPayload] = useState<RoadmapModalPayload | null>(null);

  const open = useCallback(
    (nextModal: RoadmapModalName, nextPayload?: RoadmapModalPayload) => {
      setModal(nextModal);
      setPayload(nextPayload ?? null);
    },
    [],
  );

  const close = useCallback(() => {
    setModal(null);
    setPayload(null);
  }, []);

  const value = useMemo<RoadmapModalsContextValue>(
    () => ({ modal, payload, open, close }),
    [modal, payload, open, close],
  );

  return (
    <RoadmapModalsContext.Provider value={value}>
      {children}
    </RoadmapModalsContext.Provider>
  );
}
