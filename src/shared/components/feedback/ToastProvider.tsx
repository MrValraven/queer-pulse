import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { FiCheck, FiX, FiInfo, FiRotateCcw } from 'react-icons/fi'
import { ToastContext, type ToastType, type ToastAction } from './toastContext'
import styles from './Toast.module.css'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  leaving: boolean
  action?: ToastAction
}

const ICONS: Record<ToastType, ComponentType> = {
  success: FiCheck,
  error: FiX,
  info: FiInfo,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const dismiss = useCallback(
    (id: number) => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
      )
      window.setTimeout(() => remove(id), 300)
    },
    [remove],
  )

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'success',
      durationMs?: number,
      action?: ToastAction,
    ) => {
      const id = nextId.current++
      // Action toasts (e.g. Undo) linger a little longer so they're reachable.
      const ms = durationMs ?? (action ? 5200 : 3400)
      setToasts((current) => [...current, { id, message, type, leaving: false, action }])
      window.setTimeout(() => dismiss(id), ms)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type]
          return (
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
                <Icon />
              </span>
              {toast.message}
              {toast.action && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => {
                    toast.action?.onClick()
                    dismiss(toast.id)
                  }}
                >
                  <FiRotateCcw aria-hidden />
                  {toast.action.label}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
