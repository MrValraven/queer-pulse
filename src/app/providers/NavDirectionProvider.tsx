import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { tabOf } from "../../shared/components/layout/tabRoots";

export type NavDirection = "push" | "pop" | "tab-switch" | "replace";

/** Pure classifier — unit-tested in isolation. */
export function classifyNavDirection(
  prev: string,
  next: string,
  navType: "PUSH" | "POP" | "REPLACE",
): NavDirection {
  if (navType === "REPLACE") return "replace";
  if (navType === "POP") return "pop";
  const prevTab = tabOf(prev);
  const nextTab = tabOf(next);
  if (prevTab && nextTab && prevTab !== nextTab) return "tab-switch";
  return "push";
}

const NavDirectionContext = createContext<NavDirection>("replace");

export function NavDirectionProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  // Track the previous render's pathname in state and classify when it changes,
  // using React's "adjust state during render" pattern. This keeps
  // classification a pure derivation without reading a ref during render, and is
  // safe under StrictMode's double render because the setState is conditional
  // and idempotent (a re-render with the same pathname takes the no-op branch).
  const [tracked, setTracked] = useState<{
    pathname: string;
    direction: NavDirection;
  }>({ pathname, direction: "replace" });
  let direction = tracked.direction;
  if (tracked.pathname !== pathname) {
    direction = classifyNavDirection(tracked.pathname, pathname, navType);
    setTracked({ pathname, direction });
  }
  return (
    <NavDirectionContext.Provider value={direction}>
      {children}
    </NavDirectionContext.Provider>
  );
}

export function useNavDirection(): NavDirection {
  return useContext(NavDirectionContext);
}
