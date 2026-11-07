/**
 * Which remote sheet is open (plan R27). One sheet at a time: opening
 * another swaps it in, so More hands over to the sheet it lists.
 */
import { useCallback, useMemo, useState } from "react";
import type { VjRemoteSheetId } from "../sheets/more/VjMoreSheet";

export type { VjRemoteSheetId };

export interface VjRemoteSheets {
  openSheet: VjRemoteSheetId | null;
  open: (sheet: VjRemoteSheetId) => void;
  close: () => void;
}

export function useVjRemoteSheets(): VjRemoteSheets {
  const [openSheet, setOpenSheet] = useState<VjRemoteSheetId | null>(null);
  const open = useCallback((sheet: VjRemoteSheetId) => setOpenSheet(sheet), []);
  const close = useCallback(() => setOpenSheet(null), []);
  return useMemo(() => ({ openSheet, open, close }), [openSheet, open, close]);
}
