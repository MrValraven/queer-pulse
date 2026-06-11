import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../shared/components/layout'
import { Button } from '../shared/components/ui'
import { linkToPath } from '../app/routeMap'
import styles from './NotFoundPage.module.css'

const LINKS = [
  { icon: '📖', label: 'Magazine', sub: 'June 2026 issue', to: linkToPath('QueerPulse Magazine.html') },
  { icon: '🎟️', label: 'Gatherings', sub: 'Upcoming events', to: linkToPath('QueerPulse Gathering.html') },
  { icon: '📚', label: 'Reading groups', sub: '8 groups open', to: linkToPath('QueerPulse Reading Groups.html') },
  { icon: '💬', label: 'Forum', sub: 'Community discussion', to: linkToPath('QueerPulse Forum.html') },
  { icon: '❓', label: 'Help & FAQ', sub: 'Get answers', to: linkToPath('QueerPulse Help.html') },
  { icon: '✉️', label: 'Contact us', sub: 'hello@queerpulse.pt', to: linkToPath('QueerPulse Contact.html') },
]

export function NotFoundPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(linkToPath('QueerPulse Search.html') + '?q=' + encodeURIComponent(query.trim()))
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.numBg} aria-hidden>404</div>

        <div className={styles.content}>
          <div className={styles.eyebrow}>Page not found</div>
          <h1 className={styles.title}>
            You've arrived<br /><em>somewhere else.</em>
          </h1>
          <p className={styles.sub}>
            The page you're looking for doesn't exist, has moved, or requires you to be logged in.
            It happens. Here are some places to go instead.
          </p>

          <div className={styles.actions}>
            <Button to="/">Go to homepage</Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>← Go back</Button>
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

          <form className={styles.search} onSubmit={handleSearch}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search the platform…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}
