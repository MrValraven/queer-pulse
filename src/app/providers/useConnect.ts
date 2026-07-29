import { createContext, useContext } from "react";

export interface ConnectContextValue {
  /** Open the Connect modal. Pass a member slug to address it, and a reason to
   *  preselect (`open:<id>` | `custom:<label>` | a generic REASONS id). */
  openConnect: (slug?: string, reason?: string) => void;
}

export const ConnectContext = createContext<ConnectContextValue | null>(null);

export function useConnect() {
  const ctx = useContext(ConnectContext);
  if (!ctx) {
    throw new Error("useConnect must be used within ConnectProvider");
  }
  return ctx;
}
