import { createContext, useContext } from "react";

/**
 * The studio's root element, where its menus portal so they keep the
 * studio's dark tokens. Null until the root has mounted.
 */
export const QuizshowStudioPortalContext = createContext<HTMLElement | null>(
  null,
);

export function useQuizshowStudioPortal(): HTMLElement | null {
  return useContext(QuizshowStudioPortalContext);
}
