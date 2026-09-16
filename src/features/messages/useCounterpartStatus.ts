import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useIsOnline } from "../../shared/api/realtime";
import { useDemoPresenceSimulation } from "./useDemoSignalSimulation";
import { useMessageReceipts } from "./useMessageReceipts";
import type { Conversation } from "./data";

/**
 * The open counterpart's live presence and read/delivered watermarks,
 * grouped because both are "their live status right now" and both are
 * computed HERE (not the controller) so a presence or receipt frame
 * re-renders only this panel, never the thread list beside it. Split out of
 * `ConversationPanel` to keep that component under the line cap, the same
 * way its pin/star and action-menu state already are.
 */
export function useCounterpartStatus(
  active: Conversation,
  myUserId: string | null | undefined,
): {
  isCounterpartOnline: boolean;
  counterpartLastReadAt: string | null;
  counterpartDeliveredAt: string | null;
} {
  // Demo has no presence frames: one seeded connection flips online and
  // offline on a slow cycle instead, published through `active.online` (the
  // field read below for a thread with no participant id). A no-op live.
  const { demoMode } = useDemoMode();
  useDemoPresenceSimulation(demoMode);
  // Presence for JUST this counterpart: re-renders only on THEIR status flip,
  // not every presence frame for every other member (see `useIsOnline`).
  const counterpartOnline = useIsOnline(active.otherParticipantId);
  const isCounterpartOnline =
    (!!active.otherParticipantId && counterpartOnline) ||
    (!active.otherParticipantId && !!active.online);

  const { counterpartLastReadAt, counterpartDeliveredAt } = useMessageReceipts(
    myUserId ?? null,
    active,
  );

  return { isCounterpartOnline, counterpartLastReadAt, counterpartDeliveredAt };
}
