// src/features/messages/bubbleLabelIds.ts
import { useId } from "react";

/** The ids one bubble's accessible name and description are assembled from.
 *  `content` sits on whatever node renders the message itself (text, emoji,
 *  photo, fallback), `caption` on an attachment's caption when it has one,
 *  `sender` and `details` on the hidden nodes `BubbleHiddenLabels` renders. */
export interface BubbleLabelIds {
  sender: string;
  content: string;
  caption: string;
  details: string;
}

export function useBubbleLabelIds(): BubbleLabelIds {
  const baseId = useId();
  return {
    sender: `${baseId}-sender`,
    content: `${baseId}-content`,
    caption: `${baseId}-caption`,
    details: `${baseId}-details`,
  };
}
