import { createContext } from "react";

export interface LeaveConfirmContextValue {
  /** Opens the leave dialog with `message` as its body. Resolves true when the
   *  visitor chooses Leave, false on Keep editing / Escape / scrim / close, or
   *  when dismissed. A new request while one is open resolves the older one
   *  with false first. */
  requestLeave: (message: string) => Promise<boolean>;
  /** Closes an open dialog, resolving its pending request with false. No-op
   *  when nothing is open. */
  dismissLeave: () => void;
}

export const LeaveConfirmContext =
  createContext<LeaveConfirmContextValue | null>(null);
