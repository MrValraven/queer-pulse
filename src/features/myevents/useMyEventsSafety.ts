import { useCallback, useState } from "react";
import { useSocial } from "../../app/providers/useSocial";
import type { TFunction } from "../../shared/i18n/types";
import { logError } from "../../shared/observability/logger";
import { useCreateReport } from "../safety/api/useCreateReport";
import type { ReasonCode } from "../safety/reportReasons";
import type { MyEvent } from "./myEvents.types";

interface SafetyDeps {
  byId: (id: string) => MyEvent | undefined;
  toast: (msg: string, type?: "success" | "info" | "error") => void;
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
  // Dual-mode already (no-op in demo, real `POST/DELETE /blocks/:slug` in
  // live) — the same primitive `ProfileSafetyMenu`'s "Block" wires to.
  // `toggleBlock` is a TOGGLE, so `isBlocked` has to gate it: this surface only
  // ever means "block", and calling the toggle on an already-blocked host
  // would silently UNBLOCK them (see `confirmBlock`).
  const { isBlocked, toggleBlock } = useSocial();

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
      // A safety report must never show "sent" when it wasn't — on error, keep
      // the modal open (so the member can retry with the same reason/detail)
      // and surface an honest failure, matching `ConversationReportModal`/
      // `MessageReportModal`. Only a genuine server ack closes the modal.
      createReport.mutate(
        {
          subjectType: "event",
          subjectId: eventId,
          reasonCode,
          detail: trimmedDetail.length > 0 ? trimmedDetail : undefined,
        },
        {
          onSuccess: () => {
            setReport((r) => ({ ...r, open: false }));
            toast(t("myevents:reportModal.sentToast"), "success");
          },
          onError: (error) => {
            logError(error, { scope: "myevents.reportEvent" });
            toast(t("safety:flag.error"), "error");
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
      // No member behind this event (an org-hosted gathering) means there is
      // nothing to block, so the flow never opens — `MoreMenu` already leaves
      // the "Block the host" item out in that case, and this guard keeps any
      // future entry point from opening a dialog that could only ever fake a
      // result. `host` is the host's own display name, NOT `ev.community`
      // (the community/org label isn't who's being blocked); it can still be
      // empty here, and `BlockHostConfirm` has unnamed copy for that.
      if (!ev?.hostSlug) return;
      setBlock({ open: true, eventId, host: ev.hostName ?? "" });
    },
    [byId, closeMore],
  );
  const closeBlock = useCallback(
    () => setBlock((b) => ({ ...b, open: false })),
    [],
  );
  const confirmBlock = useCallback(() => {
    const ev = block.eventId ? byId(block.eventId) : undefined;
    setBlock((b) => ({ ...b, open: false }));
    const hostSlug = ev?.hostSlug;
    // Unreachable in practice (`openBlock` refuses to open without a host
    // slug) — and if it ever were reached there is no block to report, so it
    // closes silently rather than toasting a success that didn't happen.
    if (!hostSlug) return;
    // `toggleBlock` flips state. A host the member already blocked elsewhere
    // (from their profile, say) would be UNBLOCKED by a second call, under a
    // "Blocked." toast — so an existing block is reported as-is and left
    // alone.
    if (isBlocked(hostSlug)) {
      toast(t("myevents:blockModal.alreadyBlockedToast"), "info");
      return;
    }
    toggleBlock(hostSlug);
    toast(t("myevents:blockModal.blockedToast"), "success");
  }, [block.eventId, byId, isBlocked, t, toast, toggleBlock]);

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
