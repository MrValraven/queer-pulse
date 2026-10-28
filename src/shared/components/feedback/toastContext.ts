import { createContext } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

/** Optional action button shown inside a toast (e.g. "Undo"). */
export interface ToastAction {
  label: string;
  onClick: () => void;
}

/** A toast's text: a title line, plus an optional quieter detail line under it. */
export interface ToastMessage {
  title: string;
  detail?: string;
}

export interface ToastContextValue {
  /** Shows a toast and returns its id, for a caller that may need to take it
   *  down early through `dismissToast`. Callers that ignore the id are fine.
   *  `message` is either a plain string, which renders as the title alone, or
   *  `{ title, detail }` for a title with a detail line beneath it. */
  showToast: (
    message: string | ToastMessage,
    type?: ToastType,
    durationMs?: number,
    action?: ToastAction,
  ) => number;
  /** Takes a toast down early (with its usual exit), by the id `showToast`
   *  returned. An id already gone is a no-op. */
  dismissToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
