import { AnimatePresence } from "motion/react";
import {
  closeReauthDialog,
  useReauthDialogRequest,
} from "./api/reauthDialogStore";
import { ReauthCodeModal } from "./ReauthCodeModal";

/**
 * The one step-up code dialog, mounted by ReauthCompletionProvider. Each open
 * has its own id, so a second open mounts a fresh dialog with its own code
 * request, and AnimatePresence lets the closing one play its exit. Each dialog
 * closes by its own id, so one still on its way out cannot close a newer one.
 */
export function ReauthCodeDialog() {
  const request = useReauthDialogRequest();
  return (
    <AnimatePresence>
      {request && (
        <ReauthCodeModal
          key={request.id}
          request={request}
          onClose={() => closeReauthDialog(request.id)}
        />
      )}
    </AnimatePresence>
  );
}
