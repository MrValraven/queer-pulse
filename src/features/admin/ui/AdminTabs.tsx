import styles from './adminUi.module.css'

export interface AdminTab {
  id: string
  label: string
  count?: number
}

export function AdminTabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: AdminTab[]
  active: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div className={[styles.tabs, className].filter(Boolean).join(' ')} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className={[styles.tab, active === t.id && styles.tabOn].filter(Boolean).join(' ')}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count != null && <span className={styles.tabCount}>{t.count}</span>}
        </button>
      ))}
    </div>
  )
}
