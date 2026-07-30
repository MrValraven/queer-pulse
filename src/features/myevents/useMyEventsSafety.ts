import { useCallback, useState } from "react";
import type { TFunction } from "../../shared/i18n/types";
import { logError } from "../../shared/observability/logger";
import { useCreateReport } from "../safety/api/useCreateReport";
import type { ReasonCode } from "../safety/reportReasons";
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
  submitReport: (reasonCode: ReasonCode, detail: string) => void;
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
  const createReport = useCreateReport();

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
  const submitReport = useCallback(
    (reasonCode: ReasonCode, detail: string) => {
      const eventId = report.eventId;
      if (!eventId || createReport.isPending) return;
      const trimmedDetail = detail.trim();
      // Both modes resolve with a ReportDTO: live mode POSTs `/reports`
      // (subjectType "event", the event's id as subjectId); demo mode never
      // touches the network and resolves a synthetic DTO after a short delay.
      // Either way the existing success UX — close the modal, toast — is
      // preserved. We fail open (still confirm on error) so a backend hiccup
      // never discourages a member from reporting, matching ReportListingModal.
      const finish = () => {
        setReport((r) => ({ ...r, open: false }));
        toast(t("myevents:reportModal.sentToast"), "success");
      };
      createReport.mutate(
        {
          subjectType: "event",
          subjectId: eventId,
          reasonCode,
          detail: trimmedDetail.length > 0 ? trimmedDetail : undefined,
        },
        {
          onSuccess: finish,
          onError: (error) => {
            logError(error, { scope: "myevents.reportEvent" });
            finish();
          },
        },
      );
    },
    [report.eventId, createReport, t, toast],
  );
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
