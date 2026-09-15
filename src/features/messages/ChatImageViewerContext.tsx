import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ChatMessage } from "./data";

interface ChatImageViewerApi {
  /** Opens the full screen viewer on `message`. A message that is not a
   *  viewable photo in the current thread is ignored.
   *
   *  `origin` is the bubble thumbnail the tap landed on, kept so the viewer's
   *  `?photoAnim=zoom` variant can grow the photo out of it and shrink it back
   *  into it. The ELEMENT rather than its rectangle, because the log scrolls
   *  under the open viewer and a rectangle measured at open time would aim the
   *  close at where the bubble used to be. Optional: without it the viewer
   *  falls back to its scale-and-fade, which needs no origin. */
  openImage: (message: ChatMessage, origin?: HTMLElement | null) => void;
}

const NOOP_API: ChatImageViewerApi = { openImage: () => {} };

const ChatImageViewerContext = createContext<ChatImageViewerApi>(NOOP_API);

/**
 * Carries the photo viewer's open handler from `ConversationPanel` (which owns
 * the thread's photo gallery and the action handlers) down to the image inside
 * `MessageBubbleBody`, five levels below it. A context rather than a prop
 * because the four components in between have no interest in photos, and
 * `MessageBubble` is memoized: a new prop there would have to be threaded
 * through every one of them.
 *
 * The value is memoized on `openImage` alone. An unstable value here would
 * re-render every bubble in the log on every unrelated parent render (a typing
 * frame, a receipt tick), which is the exact cost the memoization on
 * `MessageBubble` exists to avoid.
 */
export function ChatImageViewerProvider({
  openImage,
  children,
}: {
  openImage: (message: ChatMessage) => void;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ openImage }), [openImage]);
  return (
    <ChatImageViewerContext.Provider value={value}>
      {children}
    </ChatImageViewerContext.Provider>
  );
}

/** The viewer API, or an inert one when no provider is mounted (the bubble
 *  renders in tests and in any future surface without a panel around it). */
export function useChatImageViewer(): ChatImageViewerApi {
  return useContext(ChatImageViewerContext);
}
