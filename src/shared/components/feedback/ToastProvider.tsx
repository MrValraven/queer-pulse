import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import styles from './Toast.module.css'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  leaving: boolean
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastType, string> = { success: '✓', error: '✕', info: 'ℹ' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', durationMs = 3400) => {
      const id = nextId.current++
      setToasts((current) => [...current, { id, message, type, leaving: false }])

      window.setTimeout(() => {
        setToasts((current) =>
          current.map((toast) =>
            toast.id === id ? { ...toast, leaving: true } : toast,
          ),
        )
        window.setTimeout(() => remove(id), 300)
      }, durationMs)
    },
    [remove],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              styles.toast,
              styles[toast.type],
              toast.leaving && styles.leaving,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles.icon} aria-hidden>
              {ICONS[toast.type]}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
