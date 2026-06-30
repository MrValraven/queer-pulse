import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrefersReducedMotion } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { PROFILE_NAV } from './editProfileNav.data'
import styles from './EditProfilePage.module.css'

/** Sticky header offset so a scrolled-to section clears the AppNav. */
const SCROLL_OFFSET = 100

export function EditProfileSidebar() {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(PROFILE_NAV[0]!.id)

  // Scroll-spy: the section whose top is nearest the offset line wins.
  useEffect(() => {
    function onScroll() {
      let current = PROFILE_NAV[0]!.id
      for (const item of PROFILE_NAV) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top - SCROLL_OFFSET <= 1) current = item.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function goTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    setActive(id)
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <aside className={styles.nav}>
      <div className={styles.navInner}>
        {PROFILE_NAV.map((item, i) => {
          const firstInGroup = i === 0 || PROFILE_NAV[i - 1]!.group !== item.group
          return (
            <Fragment key={item.id}>
              {firstInGroup && <div className={styles.navSection}>{item.group}</div>}
              <button
                type="button"
                className={[styles.navItem, active === item.id && styles.navItemActive].filter(Boolean).join(' ')}
                aria-current={active === item.id ? 'true' : undefined}
                onClick={() => goTo(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            </Fragment>
          )
        })}
        <div className={styles.navSection}>More</div>
        <Link to={routes.pronounsGuide} className={styles.navItem}>
          <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v0M8 8v4" /></svg>
          Pronouns guide
        </Link>
      </div>
    </aside>
  )
}
