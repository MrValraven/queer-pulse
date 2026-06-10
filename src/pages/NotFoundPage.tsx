import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../shared/components/layout'
import { Button } from '../shared/components/ui'
import styles from './NotFoundPage.module.css'

const LINKS = [
  { icon: '📖', label: 'Magazine', sub: 'June 2026 issue', to: '/magazine' },
  { icon: '🎟️', label: 'Gatherings', sub: 'Upcoming events', to: '/calendar' },
  { icon: '🎬', label: 'Cinema', sub: 'This week\'s slate', to: '/cinema' },
  { icon: '💬', label: 'Forum', sub: 'Community discussion', to: '/forum' },
  { icon: '🎵', label: 'Studio', sub: 'The room is on air', to: '/studio' },
  { icon: '👥', label: 'Members', sub: 'Find your people', to: '/members' },
]

export function NotFoundPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  return (
    <PageShell>
      <div className={`wrap ${styles.wrap404}`}>
        <div className={styles.inner}>
          <div className={styles.code}>
            4<em>0</em>4
          </div>
          <div className={styles.title}>This page slipped between rooms.</div>
          <p className={styles.sub}>
            The page you're looking for doesn't exist, has moved, or requires you to be logged in.
            It happens. Here are some places to go instead.
          </p>
          <div className={styles.actions}>
            <Button to="/">Go to homepage</Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              ← Go back
            </Button>
          </div>

          <div className={styles.linksTitle}>Or try one of these</div>
          <div className={styles.grid}>
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={styles.link}>
                <span className={styles.linkIcon}>{l.icon}</span>
                <span className={styles.linkLabel}>{l.label}</span>
                <span className={styles.linkSub}>{l.sub}</span>
              </Link>
            ))}
          </div>

          <form
            className={styles.search}
            onSubmit={(e) => {
              e.preventDefault()
              if (query.trim()) navigate('/members')
            }}
          >
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search the platform…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
