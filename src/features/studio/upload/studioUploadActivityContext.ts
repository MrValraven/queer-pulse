import { createContext, useContext, useEffect, useId } from "react";

export type UploadActivityKind = "uploads" | "heldFiles" | "details";

export interface UploadActivityContextValue {
  report: (id: string, kind: UploadActivityKind, isActive: boolean) => void;
}

export const UploadActivityContext =
  createContext<UploadActivityContextValue | null>(null);

/** Tells the page's leave guard that this part holds running uploads or
 *  unsaved details. Outside a provider (an isolated render) it does nothing. */
export function useReportUploadActivity(
  kind: UploadActivityKind,
  isActive: boolean,
): void {
  const context = useContext(UploadActivityContext);
  const id = useId();
  const report = context?.report;
  useEffect(() => {
    if (!report) return;
    report(id, kind, isActive);
  }, [report, id, kind, isActive]);
  useEffect(() => {
    if (!report) return;
    return () => report(id, kind, false);
  }, [report, id, kind]);
}
