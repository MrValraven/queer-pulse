import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'info'

/** Optional action button shown inside a toast (e.g. "Undo"). */
export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    durationMs?: number,
    action?: ToastAction,
  ) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
