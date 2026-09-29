import { createContext, useContext, type ReactNode } from "react";

/**
 * Optional content `PageShell` renders as the first child of its `<main>`,
 * ahead of the page itself.
 *
 * The admin guide preview uses it to put its admin bar inside the landmark a
 * route change focuses, so the first Tab from a fresh route reaches the bar
 * before the guide body. Empty by default, so every public page renders
 * exactly as it did.
 */
export const PageShellLeadContext = createContext<ReactNode>(null);

export function usePageShellLead(): ReactNode {
  return useContext(PageShellLeadContext);
}
