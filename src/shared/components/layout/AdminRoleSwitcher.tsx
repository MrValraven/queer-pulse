import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import { useAdminRole } from '../../../features/admin/adminRole'
import { useToast } from '../feedback/useToast'
import { modPanel } from '../../../app/routeMap'
import { STEWARDED, ADMIN_PROFILE } from './adminNav.data'
import styles from './AdminShell.module.css'

const COMMUNITY_SLUGS = ['trans-hub', 'rainbow-arts']

export function AdminRoleSwitcher() {
  const { role, setRole } = useAdminRole()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const isStaff = role === 'staff'

  return (
    <div className={styles.switch} ref={ref}>
      <button
        type="button"
        className={styles.switchBtn}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.switchAv}>{ADMIN_PROFILE.initials}</span>
        <span className={styles.switchTx}>
          <span className={styles.switchRole}>{isStaff ? 'Staff admin' : 'Community mod'}</span>
          <span className={styles.switchScope}>{isStaff ? 'All communities' : 'Stewarded spaces'}</span>
        </span>
        <FiChevronDown className={[styles.switchChev, open && styles.switchChevOpen].filter(Boolean).join(' ')} aria-hidden />
      </button>

      {open && (
        <div className={styles.switchMenu} role="menu">
          <div className={styles.switchSep}>Your roles</div>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={isStaff}
            className={[styles.switchOpt, isStaff && styles.switchOptOn].filter(Boolean).join(' ')}
            onClick={() => {
              setRole('staff')
              setOpen(false)
              showToast('Now acting as Staff admin', 'info')
            }}
          >
            <span className={styles.switchOptAv} style={{ background: 'rgba(var(--accent-rgb),.2)', color: 'var(--accent-soft)' }}>
              {ADMIN_PROFILE.initials}
            </span>
            <span>
              <span className={styles.switchOptName}>Staff admin</span>
              <span className={styles.switchOptMeta}>Platform-wide oversight</span>
            </span>
          </button>

          <div className={styles.switchSep}>Communities you steward</div>
          {STEWARDED.map((c, i) => (
            <button
              key={c.name}
              type="button"
              role="menuitem"
              className={styles.switchOpt}
              onClick={() => {
                setRole('mod')
                setOpen(false)
                navigate(modPanel(COMMUNITY_SLUGS[i] ?? ''))
              }}
            >
              <span className={styles.switchOptAv} style={{ background: c.tintBg, color: c.tintFg }}>
                {c.initials}
              </span>
              <span>
                <span className={styles.switchOptName}>{c.name}</span>
                <span className={styles.switchOptMeta}>{c.meta}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
