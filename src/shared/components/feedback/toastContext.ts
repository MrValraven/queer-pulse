import { createContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

/** Optional action button shown inside a toast (e.g. "Undo"). */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastContextValue {
  /** Shows a toast and returns its id, for a caller that may need to take it
   *  down early through `dismissToast`. Callers that ignore the id are fine. */
  showToast: (
    message: string,
    type?: ToastType,
    durationMs?: number,
    action?: ToastAction,
  ) => number;
  /** Takes a toast down early (with its usual exit), by the id `showToast`
   *  returned. An id already gone is a no-op. */
  dismissToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
