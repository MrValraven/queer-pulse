import { createContext, useContext } from "react";

/**
 * How the account menu's rows navigate. In the phone sheet, which pushed a
 * history entry so Back closes it (useHistoryBackDismiss), a row replaces
 * that entry instead of pushing past it; the dropdown keeps plain pushes.
 */
const StudioMenuNavigationContext = createContext<{ shouldReplace: boolean }>({
  shouldReplace: false,
});

export const StudioMenuNavigationProvider =
  StudioMenuNavigationContext.Provider;

/** True inside the phone sheet: menu links pass `replace`. */
export function useStudioMenuShouldReplace(): boolean {
  return useContext(StudioMenuNavigationContext).shouldReplace;
}
