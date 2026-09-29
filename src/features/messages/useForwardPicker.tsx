import { useState } from "react";
import { ForwardPickerModal } from "./ForwardPickerModal";
import type { ConversationListScope } from "./mailboxes/mailboxScope";
import type { MessageForwarding } from "./useMessageForwarding";
import type { ChatMessage, Conversation } from "./data";

/**
 * Owns the "which message is being forwarded" state (armed from the message
 * overlay's Forward action / the photo viewer) and renders `ForwardPickerModal`
 * for it. Split out of `MessagesPage` purely to keep that route component
 * under the line cap. Beyond the open/close state, which the modal reads
 * back out via its `message`/`onClose` props, it hands the modal the active
 * mailbox's list scope, which the picker's server-side group search
 * (`useForwardGroupSearch`, ENG-403) runs under, so a group past the loaded
 * inbox pages is found by name without paging the whole inbox in.
 */
export function useForwardPicker(
  groups: Conversation[],
  forwardMessage: MessageForwarding["forwardMessage"],
  mailboxScope: ConversationListScope | null,
) {
  const [forwardSource, setForwardSource] = useState<ChatMessage | null>(null);
  const forwardPickerNode = forwardSource && (
    <ForwardPickerModal
      // Remount instead of reusing the instance when a different message is
      // armed while the picker is already open: there is no selection/
      // in-flight-send state worth carrying across messages, and reusing it
      // would briefly show the wrong message's recipients/sending state.
      key={forwardSource.localId ?? forwardSource.id ?? forwardSource.text}
      message={forwardSource}
      groups={groups}
      mailboxScope={mailboxScope}
      forwardMessage={forwardMessage}
      onClose={() => setForwardSource(null)}
    />
  );
  return { openForward: setForwardSource, forwardPickerNode };
}
