import { useState } from "react";
import { useAuth } from "../../../app/providers/authContext";

export interface ShareToChatController {
  /** False for a signed-out visitor: callers should render nothing at all
   *  rather than a disabled trigger (PRD-347: hidden, not gated-and-shown). */
  canShare: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Local open/close state for the "Send in a message" picker, plus the
 * signed-out gate every drop-in surface needs before rendering the trigger.
 * The picker's own data (conversations, the send fan-out) lives in
 * `ShareToChatModal`, mounted only while `isOpen`. This hook never touches
 * the network, so it costs nothing to call from a card that never opens it.
 */
export function useShareToChat(): ShareToChatController {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  return {
    canShare: Boolean(user),
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
