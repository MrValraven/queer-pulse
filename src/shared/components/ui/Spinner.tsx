import styles from './Spinner.module.css'

/** Bare spinning ring; inherits `currentColor`. */
export function Spinner({ className }: { className?: string }) {
  return <span className={[styles.spinner, className].filter(Boolean).join(' ')} aria-hidden />
}

/** Spinner + label, shown inside a submit `<Button>` while a flow is sending. */
export function Sending({ label }: { label: string }) {
  return (
    <span className={styles.loading}>
      <Spinner /> {label}
    </span>
  )
}
