import { useState, type ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import {
  classifyNavDirection,
  NavDirectionContext,
  type NavDirection,
} from "./navDirection";

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
