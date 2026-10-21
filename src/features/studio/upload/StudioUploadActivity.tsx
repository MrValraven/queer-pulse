import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  UploadActivityContext,
  type UploadActivityKind,
} from "./studioUploadActivityContext";
import { useStudioUploadLeaveGuard } from "./useStudioUploadLeaveGuard";

/**
 * One leave guard for a whole upload page. Parts deep in the flow (the
 * upload list, each track's details panel, the episode form) report what
 * they hold, so the page asks once, with one dialog, whatever is pending.
 * The page's own state comes in through the props.
 */
export function StudioUploadActivityProvider({
  hasActiveUploads = false,
  hasUnsavedDetails = false,
  keptParams,
  children,
}: {
  hasActiveUploads?: boolean;
  hasUnsavedDetails?: boolean;
  /** The params naming the draft (see useStudioUploadLeaveGuard). */
  keptParams?: readonly string[];
  children: ReactNode;
}) {
  const [activeIds, setActiveIds] = useState<
    ReadonlyMap<string, UploadActivityKind>
  >(() => new Map());
  const report = useCallback(
    (id: string, kind: UploadActivityKind, isActive: boolean) =>
      setActiveIds((previous) => {
        if (isActive === previous.has(id)) return previous;
        const next = new Map(previous);
        if (isActive) next.set(id, kind);
        else next.delete(id);
        return next;
      }),
    [],
  );
  const reportedKinds = [...activeIds.values()];
  useStudioUploadLeaveGuard({
    hasActiveUploads: hasActiveUploads || reportedKinds.includes("uploads"),
    hasHeldFiles: reportedKinds.includes("heldFiles"),
    hasUnsavedDetails: hasUnsavedDetails || reportedKinds.includes("details"),
    keptParams,
  });
  const value = useMemo(() => ({ report }), [report]);
  return (
    <UploadActivityContext.Provider value={value}>
      {children}
    </UploadActivityContext.Provider>
  );
}
