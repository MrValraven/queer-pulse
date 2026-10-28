import { createContext, useContext, type RefObject } from "react";

/** The owner's "View as visitor" preview of their own artist page. */
export interface StudioVisitorPreview {
  /** The page shows the owner what a visitor sees. Visitor controls then
   *  render as disabled look-alikes, so nothing fires for the own persona. */
  isVisitorPreview: boolean;
  /** Starts the preview; null outside an owner's artist page. */
  enterVisitorPreview: (() => void) | null;
  /** The View as visitor control, which takes focus back when the preview
   *  ends. */
  visitorControlRef: RefObject<HTMLButtonElement | null> | null;
}

const NO_VISITOR_PREVIEW: StudioVisitorPreview = {
  isVisitorPreview: false,
  enterVisitorPreview: null,
  visitorControlRef: null,
};

/**
 * Provided by the artist page, so the hero, the main column and the side
 * cards all read the same preview without each taking a prop.
 */
const StudioVisitorPreviewContext =
  createContext<StudioVisitorPreview>(NO_VISITOR_PREVIEW);

export const StudioVisitorPreviewProvider =
  StudioVisitorPreviewContext.Provider;

/** The preview state, or "not previewing" outside the artist page. */
export function useStudioVisitorPreview(): StudioVisitorPreview {
  return useContext(StudioVisitorPreviewContext);
}
