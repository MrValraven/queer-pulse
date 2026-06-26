import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { communities } from '../homepage/data/communities'
import type { Community, CommunityType } from '../homepage/data/types'
import { JoinModal } from './JoinModal'
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
  const [filter, setFilter] = useState<'all' | CommunityType>('all')
  const [joined, setJoined] = useState<Set<string>>(new Set())
  const [joining, setJoining] = useState<Community | null>(null)

  const visible = useMemo(
    () => (filter === 'all' ? communities : communities.filter((c) => c.type === filter)),
    [filter],
  )

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
          <Reveal className={styles.filters}>
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
          </Reveal>

          <div className={styles.grid}>
            {visible.map((community, index) => {
              const hasJoined = joined.has(community.name)
              return (
                <Reveal key={community.name} delay={Math.min(index, 6) * 45}>
                  <Link
                    to={`/community/${community.slug}`}
                    className={styles.card}
                  >
                  <span className={[styles.type, styles[community.type]].join(' ')}>
                    {community.typeLabel}
                  </span>
                  <div className={styles.name}>{community.name}</div>
                  <p className={styles.desc}>{community.description}</p>
                  <div className={styles.foot}>
                    <span className={styles.meta}>{community.count}</span>
                    {hasJoined ? (
                      <span className={[styles.joinBtn, styles.joined].join(' ')}><FiCheck /> Joined</span>
                    ) : community.privateBadge ? (
                      <span className={styles.joinBtn}>Enter →</span>
                    ) : (
                      <span
                        className={styles.joinBtn}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setJoining(community)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            setJoining(community)
                          }
                        }}
                      >
                        Join
                      </span>
                    )}
                  </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>

      <Outro
        title={<>Not finding the right <em>space?</em></>}
        sub="Suggest a community to add to the directory, or post on the board to find people who share your interest — and maybe start something together."
      >
        <Button to="/#board" size="lg">
          See the board →
        </Button>
      </Outro>

      {joining && (
        <JoinModal
          community={{
            name: joining.name,
            typeLabel: joining.typeLabel,
            count: joining.count,
            description: joining.description,
          }}
          onClose={() => setJoining(null)}
          onJoined={() => setJoined((current) => new Set(current).add(joining.name))}
        />
      )}
    </PageShell>
  )
}
