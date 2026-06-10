import type { ReactNode } from 'react'
import { Reveal } from '../../shared/components/ui'
import styles from './resources.module.css'

interface ResourceHeroProps {
  eyebrow: string
  eyebrowDotColor: string
  title: ReactNode
  lead: string
  anchors: { label: string; href: string }[]
}

/** Shared plum hero used by the resource pages (Wellbeing, Trans Hub, Legal). */
export function ResourceHero({ eyebrow, eyebrowDotColor, title, lead, anchors }: ResourceHeroProps) {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <Reveal className={styles.eyebrow}>
          <span className={styles.eyebrowDot} style={{ background: eyebrowDotColor }} />
          {eyebrow}
        </Reveal>
        <Reveal as="h1" className={styles.title} delay={60}>
          {title}
        </Reveal>
        <Reveal as="p" className={styles.lead} delay={120}>
          {lead}
        </Reveal>
        <Reveal className={styles.heroNav} delay={160}>
          {anchors.map((anchor) => (
            <a key={anchor.href} href={anchor.href} className={styles.heroAnchor}>
              {anchor.label}
            </a>
          ))}
        </Reveal>
      </div>
    </header>
  )
}
