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
  overlays: Omit<
    ConversationOverlaysProps,
    "active" | "myUserId" | "groupSeenBy"
  >;
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
      {/* PRD-351: the "Info" surface reuses the conversation, member id and
          live "Seen by" receipt the group sheets already receive. */}
      <ConversationOverlays
        {...overlays}
        active={groupModals.active}
        myUserId={groupModals.myUserId}
        groupSeenBy={groupModals.groupSeenBy}
      />
      <ConversationGroupModals {...groupModals} />
    </>
  );
}
