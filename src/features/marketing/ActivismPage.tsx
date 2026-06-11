import { useEffect, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { ACTIVISM_NAV, CONVICTION_ITEMS } from './activism.data'
import { StartSection, LocalSection, SkillsSection, MobiliseSection, FeelSection, OrgsSection, VolunteerSection } from './ActivismSections'
import m from './marketing.module.css'
import s from './ActivismPage.module.css'

export function ActivismPage() {
  const [active, setActive] = useState('start')

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 140
      for (const { id } of ACTIVISM_NAV) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <PageShell>
      <header className={`${m.hero} ${m.heroPlum}`}>
        <div className="wrap">
          <div className={m.eyebrow}>Activism &amp; community action</div>
          <h1 className={m.heroTitle}>
            Your activism <em>matters</em> — even when it doesn't feel like it.
          </h1>
          <p className={m.heroSub}>Community action is not just for full-time activists. It's for the person who shows up, who uses their skills, who makes their neighbourhood a little better. This page is for you.</p>
          <div className={s.conviction}>
            {CONVICTION_ITEMS.map((c) => (
              <div key={c.n} className={s.convItem}>
                <div className="n" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 26, color: 'var(--accent)', marginBottom: 6 }}>{c.n}</div>
                <div style={{ fontSize: 14, color: 'rgba(247,243,238,.7)', lineHeight: 1.55 }}>{c.l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className={s.layout}>
          <nav className={s.nav}>
            <div className={s.navLabel}>On this page</div>
            {ACTIVISM_NAV.map((item) => (
              <a key={item.id} href={`#${item.id}`} className={[s.navItem, active === item.id && s.navItemActive].filter(Boolean).join(' ')}>
                {item.label}
              </a>
            ))}
          </nav>

          <div>
            <StartSection />
            <hr className={s.divider} />
            <LocalSection />
            <hr className={s.divider} />
            <SkillsSection />
            <hr className={s.divider} />
            <MobiliseSection />
            <hr className={s.divider} />
            <FeelSection />
            <hr className={s.divider} />
            <OrgsSection />
            <hr className={s.divider} />
            <VolunteerSection />
          </div>
        </div>
      </div>
    </PageShell>
  )
}
