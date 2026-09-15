import { useCallback, useRef, useState, type RefObject } from "react";
import {
  findPhotoIndex,
  useThreadImageGallery,
  type ViewerPhoto,
} from "./useThreadImageGallery";
import type { ChatMessage } from "./data";

/**
 * The open conversation's photo gallery plus which photo the viewer is showing.
 * Split out of `ConversationPanel` to keep that component under the line cap,
 * the same way its pin/star and action-menu state already are.
 *
 * `openImage` is `useCallback`-stable so the context value wrapped around the
 * message log stays identity-stable across unrelated re-renders.
 *
 * The bubble the viewer was opened from is kept in a REF, not in state. It is
 * only ever read by the viewer's open/close animation, so putting it in state
 * would re-render the whole panel to tell it something nothing renders from —
 * and a ref also keeps `openImage`'s identity out of it entirely.
 */
export function useChatImageViewerState(
  messageGroups: { day: string; items: ChatMessage[] }[],
  options: {
    counterpartName: string;
    youLabel: string;
    counterpartAvatar?: string;
    youAvatar?: string;
  },
): {
  photos: ViewerPhoto[];
  openIndex: number | null;
  /** The bubble thumbnail the open viewer grew out of, live so the close can
   *  re-measure it after the log has scrolled. Null when the viewer was opened
   *  from somewhere without one. */
  openOriginRef: RefObject<HTMLElement | null>;
  openImage: (message: ChatMessage, origin?: HTMLElement | null) => void;
  closeViewer: () => void;
} {
  const photos = useThreadImageGallery(messageGroups, options);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openOriginRef = useRef<HTMLElement | null>(null);

  const openImage = useCallback(
    (message: ChatMessage, origin?: HTMLElement | null) => {
      const index = findPhotoIndex(photos, message);
      if (index < 0) return;
      openOriginRef.current = origin ?? null;
      setOpenIndex(index);
    },
    [photos],
  );

  // The origin is deliberately left alone here: the viewer is still on screen
  // playing its exit when this runs, and clearing the bubble it is flying back
  // to would drop it into the fade halfway through. The next open overwrites it.
  const closeViewer = useCallback(() => setOpenIndex(null), []);

  return { photos, openIndex, openOriginRef, openImage, closeViewer };
}
