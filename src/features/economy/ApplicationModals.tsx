import { type Application, type ActionKind } from "./applicationStatus.data";
import { SubmissionModal, CompanyModal, NoteModal } from "./ApplicationDetailModals";
import { MessageModal } from "./MessageModals";
import { CalendarModal } from "./CalendarModal";
import { WithdrawModal } from "./WithdrawModal";
import { NegotiationPlanner } from "./NegotiationPlanner";
import { OfferRespondModal } from "./OfferRespondModal";
import { ResumeModal } from "./ResumeModal";

// Shared modal primitives live in ./ModalKit; the individual application
// modals were split into their own files. Re-exported here so existing
// importers of ./ApplicationModals keep working unchanged.
export { FileIcon, ModalShell } from "./ModalKit";
export { MessageModal, type MsgVariant } from "./MessageModals";
export { CalendarModal } from "./CalendarModal";
export { WithdrawModal } from "./WithdrawModal";
export { NegotiationPlanner } from "./NegotiationPlanner";
export { OfferRespondModal } from "./OfferRespondModal";
export { ResumeModal } from "./ResumeModal";

/** Routes an action kind to the right modal. */
export function ApplicationModal({
  action,
  app,
  onClose,
  onPatch,
}: {
  action: ActionKind;
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  switch (action) {
    case "message":
      return <MessageModal app={app} variant="message" onClose={onClose} onPatch={onPatch} />;
    case "followup":
      return <MessageModal app={app} variant="followup" onClose={onClose} onPatch={onPatch} />;
    case "conversation":
      return <MessageModal app={app} variant="conversation" onClose={onClose} onPatch={onPatch} />;
    case "calendar":
      return <CalendarModal app={app} onClose={onClose} />;
    case "company":
      return <CompanyModal app={app} onClose={onClose} />;
    case "submission":
      return <SubmissionModal app={app} onClose={onClose} />;
    case "note":
      return <NoteModal app={app} onClose={onClose} />;
    case "negotiate":
      return <NegotiationPlanner app={app} onClose={onClose} />;
    case "resume":
      return <ResumeModal app={app} onClose={onClose} onPatch={onPatch} />;
    case "offer":
      return <OfferRespondModal app={app} onClose={onClose} onPatch={onPatch} />;
    case "withdraw":
      return <WithdrawModal app={app} onClose={onClose} onPatch={onPatch} />;
  }
}
