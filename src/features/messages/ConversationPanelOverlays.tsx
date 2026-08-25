// src/features/messages/ConversationPanelOverlays.tsx
import {
  ConversationGroupModals,
  type ConversationGroupModalsProps,
} from "./ConversationGroupModals";
import {
  ConversationOverlays,
  type ConversationOverlaysProps,
} from "./ConversationOverlays";

interface ConversationPanelOverlaysProps {
  /** The message action overlay/context-menu + delete-confirm + report-modal
   *  surfaces (`useMessageActionMenu`'s own state/handlers). */
  overlays: ConversationOverlaysProps;
  /** The group-info + "Seen by" sheet (groups only). */
  groupModals: ConversationGroupModalsProps;
}

/** The floating action/report overlays and the group-management sheets — both
 *  purely presentational, prop-driven surfaces `ConversationPanel` can have
 *  open at once — grouped into one wrapper so that component stays under the
 *  line cap. */
export function ConversationPanelOverlays({
  overlays,
  groupModals,
}: ConversationPanelOverlaysProps) {
  return (
    <>
      <ConversationOverlays {...overlays} />
      <ConversationGroupModals {...groupModals} />
    </>
  );
}
