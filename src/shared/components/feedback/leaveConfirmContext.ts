import { createContext } from "react";

export interface LeaveRequestOptions {
  /** When set, the dialog also offers "Save and leave", which runs this and
   *  leaves once it settles. The handler resolves true when everything saved;
   *  false (or a throw) keeps the visitor on the page. */
  onSaveAndLeave?: () => Promise<boolean>;
}

export interface LeaveConfirmContextValue {
  /** Opens the leave dialog with `message` as its body. Resolves true when the
   *  visitor chooses Leave, or chooses Save and leave and the save succeeds.
   *  Resolves false on Keep editing / Escape / scrim / close, on a failed
   *  save, or when dismissed. A new request while one is open resolves the
   *  older one with false first. */
  requestLeave: (
    message: string,
    options?: LeaveRequestOptions,
  ) => Promise<boolean>;
  /** Closes an open dialog, resolving its pending request with false. No-op
   *  when nothing is open. */
  dismissLeave: () => void;
}

export const LeaveConfirmContext =
  createContext<LeaveConfirmContextValue | null>(null);
