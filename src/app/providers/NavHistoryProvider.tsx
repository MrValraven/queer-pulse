import { useState, type ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import {
  foldNavigation,
  previousNavEntry,
  type NavEntry,
  type NavStack,
} from "../navHistory";
import { PreviousLocationContext } from "./previousLocation";

/**
 * Tracks a short tail of visited entries so a page can offer a way back to
 * wherever the visitor actually came from (see `profileBackTarget`), instead of
 * a hardcoded parent that is wrong for everyone who arrived from somewhere
 * else.
 *
 * Like `NavDirectionProvider`, it uses React's "adjust state during render"
 * pattern rather than an effect: the stack must be current on the very first
 * render of the new page (a back link can't flash the wrong destination for a
 * frame), and the update is conditional and idempotent — folding an entry
 * that's already on top returns the same stack — so StrictMode's double render
 * is safe.
 */
export function NavHistoryProvider({ children }: { children: ReactNode }) {
  const { pathname, search, key } = useLocation();
  const navigationType = useNavigationType();
  const entry: NavEntry = { pathname, search, key };

  const [stack, setStack] = useState<NavStack>(() => [entry]);
  let current = stack;
  if (stack[stack.length - 1]?.key !== key) {
    current = foldNavigation(stack, entry, navigationType);
    setStack(current);
  }

  // The value is an entry object held inside the stack, so its identity is
  // stable for as long as the previous entry is — no fresh object per render
  // for consumers' effects to churn on.
  return (
    <PreviousLocationContext.Provider value={previousNavEntry(current)}>
      {children}
    </PreviousLocationContext.Provider>
  );
}
