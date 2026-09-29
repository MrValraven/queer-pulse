import type { ChatMessage } from "./data";
import type { MessageSending } from "./useMessageSending";
import { useReturnToLatestFirst } from "./useReturnToLatestFirst";

/** Stands in for the session sends while a detached window is shown. */
const NO_SESSION_SENDS: Record<string, ChatMessage[]> = {};

/**
 * PRD-401: the session sends the open thread renders. A detached history
 * window ends before the live tail, where session sends belong, so it gets
 * none; they show again once the thread is back at the tail.
 */
export function sessionSendsForThreadWindow(
  sessionSends: Record<string, ChatMessage[]>,
  isThreadWindowShown: boolean,
): Record<string, ChatMessage[]> {
  return isThreadWindowShown ? NO_SESSION_SENDS : sessionSends;
}

type ThreadWindowSends = Pick<
  MessageSending,
  | "send"
  | "sendGif"
  | "sendSticker"
  | "sendImage"
  | "sendDocument"
  | "retrySend"
>;

/**
 * PRD-401: every way the member puts a new bubble into the open thread from
 * the thread itself (the composer's sends and a failed bubble's retry) goes
 * through `useReturnToLatestFirst`, so it leaves a detached history window for
 * the live tail and cancels a window request or jump hunt still on its way.
 * A forward into the open thread does the same inside `useMessageForwarding`.
 * Each wrapper keeps its identity for as long as its send and
 * `returnToLatest` do.
 */
export function useThreadWindowSends(
  sending: ThreadWindowSends,
  returnToLatest: () => void,
): ThreadWindowSends {
  const send = useReturnToLatestFirst(sending.send, returnToLatest);
  const sendGif = useReturnToLatestFirst(sending.sendGif, returnToLatest);
  const sendSticker = useReturnToLatestFirst(
    sending.sendSticker,
    returnToLatest,
  );
  const sendImage = useReturnToLatestFirst(sending.sendImage, returnToLatest);
  const sendDocument = useReturnToLatestFirst(
    sending.sendDocument,
    returnToLatest,
  );
  const retrySend = useReturnToLatestFirst(sending.retrySend, returnToLatest);
  return { send, sendGif, sendSticker, sendImage, sendDocument, retrySend };
}
