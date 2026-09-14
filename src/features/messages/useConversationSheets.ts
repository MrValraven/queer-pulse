import { useCallback, useState } from "react";

export interface ConversationSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Whether the group-info / management view and the "Seen by" sheet are open
 * (both groups-only overlays `ConversationPanel` can have up at once). Split
 * out of `ConversationPanel` to keep that component under the line cap, the
 * same way its pin/star and action-menu state already are. Grouped one sheet
 * per key (rather than six flat fields) so the call site stays a one-line
 * destructure.
 */
export function useConversationSheets(): {
  groupInfo: ConversationSheetState;
  seenBy: ConversationSheetState;
} {
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isSeenByOpen, setIsSeenByOpen] = useState(false);

  const openGroupInfo = useCallback(() => setIsGroupInfoOpen(true), []);
  const closeGroupInfo = useCallback(() => setIsGroupInfoOpen(false), []);
  const openSeenBy = useCallback(() => setIsSeenByOpen(true), []);
  const closeSeenBy = useCallback(() => setIsSeenByOpen(false), []);

  return {
    groupInfo: {
      isOpen: isGroupInfoOpen,
      open: openGroupInfo,
      close: closeGroupInfo,
    },
    seenBy: { isOpen: isSeenByOpen, open: openSeenBy, close: closeSeenBy },
  };
}
