import { createContext, useContext } from "react";

export interface ConnectContextValue {
  /** Open the Connect modal, addressed to `slug`. Optionally preselect a
   *  reason (`open:<id>` | `custom:<label>` | a generic REASONS id).
   *
   *  `slug` is REQUIRED. Called without one, live mode resolved the recipient
   *  to null and rendered a dead error sheet, while demo mode silently
   *  addressed a random persona and reported the message as sent. Anything
   *  that wants "get in touch" with no specific member belongs on
   *  `routes.contact`. */
  openConnect: (slug: string, reason?: string) => void;
}

export const ConnectContext = createContext<ConnectContextValue | null>(null);

export function useConnect() {
  const ctx = useContext(ConnectContext);
  if (!ctx) {
    throw new Error("useConnect must be used within ConnectProvider");
  }
  return ctx;
}
