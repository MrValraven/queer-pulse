import { createContext, useContext } from "react";
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

export const NavDirectionContext = createContext<NavDirection>("replace");

export function useNavDirection(): NavDirection {
  return useContext(NavDirectionContext);
}
