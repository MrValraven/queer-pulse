import { FiGlobe, FiUsers, FiShield } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { ResourceHero } from './ResourceHero'
import { TIERS, HOW_TO } from './communityPrivacy.data'
import styles from './resources.module.css'

const ICONS: Record<string, IconType> = { globe: FiGlobe, users: FiUsers, shield: FiShield }

export function CommunityPrivacyPage() {
  return (
    <PageShell>
      <ResourceHero
        eyebrow="Coming Out · Privacy"
        eyebrowDotColor="var(--violet)"
        title={<>You control <em>what's visible.</em></>}
        lead="This space runs on reduced visibility by default. Here's exactly what shows where — on your public profile, inside the community, and to the mod team — so you can be here on your own terms."
        anchors={[
          { label: 'What shows where', href: '#tiers' },
          { label: 'Your controls', href: '#controls' },
        ]}
      />

      <section className={`${styles.section} ${styles.sectionPaper}`} id="tiers">
        <div className="wrap">
          <Reveal as="h2">What shows <em>where</em></Reveal>
          <Reveal as="p" className={styles.leadP}>
            Three layers, from fully public to mod-only. Most of this space lives in the bottom two.
          </Reveal>
          <div>
            {TIERS.map((t) => {
              const Icon = ICONS[t.icon]
              return (
                <Reveal key={t.title} className={styles.featureRow}>
                  <span className={styles.featureIcon}><Icon aria-hidden /></span>
                  <div>
                    <div className={styles.cardName} style={{ fontSize: 19 }}>{t.title}</div>
                    <div className={styles.cardSpec} style={{ marginTop: 4 }}>{t.body}</div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionCream}`} id="controls">
        <div className="wrap">
          <Reveal as="h2">Your <em>controls</em></Reveal>
          <div className={styles.checklist}>
            {HOW_TO.map((h) => (
              <Reveal key={h} className={styles.checkItem} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.cardSpec} style={{ flex: 'none' }}>{h}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Nothing here is <em>on your profile.</em></>}
        sub="Adjust your visibility any time — it's all in your settings."
      >
        <Button to={routes.settings} variant="primary" size="lg">
          Open privacy settings
        </Button>
      </Outro>
    </PageShell>
  )
}
