import { useCallback, useState } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { MyEvent } from "./myEvents.types";

interface SafetyDeps {
  byId: (id: string) => MyEvent | undefined;
  toast: (msg: string, type?: "success" | "info") => void;
  closeMore: () => void;
  t: TFunction;
}

export interface MyEventsSafety {
  report: { open: boolean; evId: string | null };
  openReport: (evId: string) => void;
  closeReport: () => void;
  submitReport: () => void;
  block: { open: boolean; evId: string | null; host: string };
  openBlock: (evId: string) => void;
  closeBlock: () => void;
  confirmBlock: () => void;
}

/** Report + block safety flows (close the more-menu, then open the flow). */
export function useMyEventsSafety({
  byId,
  toast,
  closeMore,
  t,
}: SafetyDeps): MyEventsSafety {
  const [report, setReport] = useState<{ open: boolean; evId: string | null }>({
    open: false,
    evId: null,
  });
  const [block, setBlock] = useState<{
    open: boolean;
    evId: string | null;
    host: string;
  }>({ open: false, evId: null, host: "" });

  const openReport = useCallback(
    (evId: string) => {
      closeMore();
      setReport({ open: true, evId });
    },
    [closeMore],
  );
  const closeReport = useCallback(
    () => setReport((r) => ({ ...r, open: false })),
    [],
  );
  const submitReport = useCallback(() => {
    setReport((r) => ({ ...r, open: false }));
    toast(t("myevents:reportModal.sentToast"), "success");
  }, [t, toast]);
  const openBlock = useCallback(
    (evId: string) => {
      const ev = byId(evId);
      closeMore();
      setBlock({ open: true, evId, host: ev?.community ?? "" });
    },
    [byId, closeMore],
  );
  const closeBlock = useCallback(
    () => setBlock((b) => ({ ...b, open: false })),
    [],
  );
  const confirmBlock = useCallback(() => {
    setBlock((b) => ({ ...b, open: false }));
    toast(t("myevents:blockModal.blockedToast"), "success");
  }, [t, toast]);

  return {
    report,
    openReport,
    closeReport,
    submitReport,
    block,
    openBlock,
    closeBlock,
    confirmBlock,
  };
}
