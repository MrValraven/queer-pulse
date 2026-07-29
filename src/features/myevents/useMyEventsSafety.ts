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
  report: { open: boolean; eventId: string | null };
  openReport: (eventId: string) => void;
  closeReport: () => void;
  submitReport: () => void;
  block: { open: boolean; eventId: string | null; host: string };
  openBlock: (eventId: string) => void;
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
  const [report, setReport] = useState<{ open: boolean; eventId: string | null }>({
    open: false,
    eventId: null,
  });
  const [block, setBlock] = useState<{
    open: boolean;
    eventId: string | null;
    host: string;
  }>({ open: false, eventId: null, host: "" });

  const openReport = useCallback(
    (eventId: string) => {
      closeMore();
      setReport({ open: true, eventId });
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
    (eventId: string) => {
      const ev = byId(eventId);
      closeMore();
      setBlock({ open: true, eventId, host: ev?.community ?? "" });
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
