import { FiSearch, FiDownload } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import {
  AUDIT_MODERATORS,
  AUDIT_ACTIONS,
  AUDIT_RANGE_OPTIONS,
  type AuditFilterState,
} from './adminGovernance.data'
import styles from './AdminGovernancePage.module.css'

export function AdminGovernanceAuditFilters({
  filters,
  onChange,
  onExport,
}: {
  filters: AuditFilterState
  onChange: (next: AuditFilterState) => void
  onExport: () => void
}) {
  const set = <K extends keyof AuditFilterState>(key: K, value: AuditFilterState[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className={styles.filterBar}>
      <label className={styles.search}>
        <FiSearch className={styles.searchIco} aria-hidden />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search reason or subject…"
          value={filters.query}
          onChange={(e) => set('query', e.target.value)}
          aria-label="Search the audit log"
        />
      </label>

      <Select
        label="Filter by moderator"
        value={filters.moderator}
        options={AUDIT_MODERATORS}
        onChange={(v) => set('moderator', v)}
      />
      <Select
        label="Filter by action"
        value={filters.action}
        options={AUDIT_ACTIONS}
        onChange={(v) => set('action', v)}
      />
      <Select
        label="Filter by time range"
        value={filters.range}
        options={AUDIT_RANGE_OPTIONS}
        onChange={(v) => set('range', v)}
      />

      <Button variant="ghost" onClick={onExport}>
        <FiDownload aria-hidden /> Export CSV
      </Button>
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <select
      className={styles.select}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
