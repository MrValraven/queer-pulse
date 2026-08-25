import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ItemDrawerContext,
  type ItemDrawerContextValue,
} from "./itemDrawerContext";

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
