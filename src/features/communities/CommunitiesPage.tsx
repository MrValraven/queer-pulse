import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Reveal } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { communities } from '../homepage/data/communities'
import type { CommunityType } from '../homepage/data/types'
import styles from './CommunitiesPage.module.css'

const FILTERS: { value: 'all' | CommunityType; label: string }[] = [
  { value: 'all', label: 'All communities' },
  { value: 'social', label: 'Social' },
  { value: 'arts', label: 'Arts' },
  { value: 'activism', label: 'Activism' },
  { value: 'support', label: 'Support' },
  { value: 'sports', label: 'Sports' },
  { value: 'professional', label: 'Professional' },
]

export function CommunitiesPage() {
  const { showToast } = useToast()
  const [filter, setFilter] = useState<'all' | CommunityType>('all')
  const [joined, setJoined] = useState<Set<string>>(new Set())

  const visible = useMemo(
    () => (filter === 'all' ? communities : communities.filter((c) => c.type === filter)),
    [filter],
  )

  function join(name: string) {
    setJoined((current) => new Set(current).add(name))
    showToast(`Joined ${name}`, 'success')
  }

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.eyebrow}>
            Community Directory
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            Find your <em>people.</em>
          </Reveal>
          <Reveal as="p" className={styles.lede} delay={120}>
            A living directory of queer communities across Lisbon. Social clubs, arts
            collectives, activist groups, sports teams, support circles, and professional
            networks — something for where you are right now.
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.filters}>
            {FILTERS.map((option) => (
              <button
                key={option.value}
                className={[styles.chip, filter === option.value && styles.chipActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {visible.map((community) => {
              const hasJoined = joined.has(community.name)
              return (
                <div key={community.name} className={styles.card}>
                  <span className={[styles.type, styles[community.type]].join(' ')}>
                    {community.typeLabel}
                  </span>
                  <div className={styles.name}>{community.name}</div>
                  <p className={styles.desc}>{community.description}</p>
                  <div className={styles.foot}>
                    <span className={styles.meta}>{community.count}</span>
                    <button
                      className={[styles.joinBtn, hasJoined && styles.joined]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => !hasJoined && join(community.name)}
                    >
                      {hasJoined ? '✓ Joined' : 'Join'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
