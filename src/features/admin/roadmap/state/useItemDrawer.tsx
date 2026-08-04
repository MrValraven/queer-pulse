import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Which roadmap item's drawer is open, shared by every view that can open
 * one (Board, Timeline, Guides, Capacity, Ideas, Public preview, …) and the
 * drawer itself (`roadmap/drawer/ItemDrawer.tsx`, built in Task C3). A
 * context rather than lifted state because the opener and the drawer are
 * siblings several views apart — threading `openId`/`open`/`close` as props
 * through the tab switch would leak drawer plumbing into every view's prop
 * API for no reason.
 */
interface ItemDrawerContextValue {
  /** The open item's id, or `null` when the drawer is closed. */
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function ItemDrawerProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  const value = useMemo<ItemDrawerContextValue>(
    () => ({ openId, open, close }),
    [openId, open, close],
  );

  return (
    <ItemDrawerContext.Provider value={value}>
      {children}
    </ItemDrawerContext.Provider>
  );
}

export function useItemDrawer(): ItemDrawerContextValue {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return context;
}
