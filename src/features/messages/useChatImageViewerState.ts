import { useCallback, useState } from "react";
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
 */
export function useChatImageViewerState(
  messageGroups: { day: string; items: ChatMessage[] }[],
  options: { counterpartName: string; youLabel: string },
): {
  photos: ViewerPhoto[];
  openIndex: number | null;
  openImage: (message: ChatMessage) => void;
  closeViewer: () => void;
} {
  const photos = useThreadImageGallery(messageGroups, options);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const openImage = useCallback(
    (message: ChatMessage) => {
      const index = findPhotoIndex(photos, message);
      if (index >= 0) setOpenIndex(index);
    },
    [photos],
  );

  const closeViewer = useCallback(() => setOpenIndex(null), []);

  return { photos, openIndex, openImage, closeViewer };
}
