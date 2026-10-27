import { createContext, useContext } from "react";

/**
 * Opens the "Edit Studio page" sheet. The artist page provides it for an
 * owner only, so the hero's action row draws the button whenever the
 * opener is there, without the hero passing a prop through.
 */
const StudioEditPageOpenerContext = createContext<(() => void) | null>(null);

export const StudioEditPageOpenerProvider =
  StudioEditPageOpenerContext.Provider;

/** The opener, or null outside an owner's artist page. */
export function useStudioEditPageOpener(): (() => void) | null {
  return useContext(StudioEditPageOpenerContext);
}
