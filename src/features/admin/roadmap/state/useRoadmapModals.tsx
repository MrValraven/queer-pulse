import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The 8 roadmap admin modals (Task C4), addressed by name from any view or
 * from the item drawer. One-at-a-time — opening a new modal replaces
 * whichever was open, matching the prototype's single dialog stack.
 */
export type RoadmapModalName =
  | "slip"
  | "safety"
  | "merge"
  | "decline"
  | "notify"
  | "digest"
  | "audit"
  | "shortcuts";

/**
 * Permissive payload every modal reads from. Not every field applies to
 * every modal — `slip` reads `itemId`/`from`/`to`, `merge`/`decline` read
 * `ideaId`, `notify` reads `itemId`, `digest`/`audit`/`shortcuts` read
 * nothing. Kept as one shape (rather than a modal-keyed discriminated union)
 * because `open()` is called from many different views that shouldn't need
 * to import every modal's specific payload type.
 */
export interface RoadmapModalPayload {
  itemId?: string;
  ideaId?: string;
  from?: string;
  to?: string;
}

interface RoadmapModalsContextValue {
  modal: RoadmapModalName | null;
  payload: RoadmapModalPayload | null;
  open: (modal: RoadmapModalName, payload?: RoadmapModalPayload) => void;
  close: () => void;
}

const RoadmapModalsContext = createContext<RoadmapModalsContextValue | null>(
  null,
);

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

export function useRoadmapModals(): RoadmapModalsContextValue {
  const context = useContext(RoadmapModalsContext);
  if (!context) {
    throw new Error(
      "useRoadmapModals must be used within a RoadmapModalsProvider",
    );
  }
  return context;
}
