import { useLocation } from 'react-router-dom'
import { PageShell } from '../shared/components/layout'
import { Button, Eyebrow } from '../shared/components/ui'
import styles from './PlaceholderPage.module.css'

/** Turn a path like "/business-directory" into "Business Directory". */
function titleFromPath(pathname: string): string {
  const slug = pathname.replace(/^\//, '').split('/')[0]
  if (!slug) return 'QueerPulse'
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function PlaceholderPage() {
  const { pathname } = useLocation()
  const title = titleFromPath(pathname)

  return (
    <PageShell>
      <section className={styles.page}>
        <div className={styles.inner}>
          <Eyebrow className={styles.eyebrow}>Coming soon</Eyebrow>
          <h1 className={styles.title}>
            {title} is <em>on the way.</em>
          </h1>
          <p className={styles.sub}>
            This part of QueerPulse is still being built. The homepage is live — explore
            members, gatherings, and the community there in the meantime.
          </p>
          <Button size="lg" to="/">
            Back to home
          </Button>
        </div>
      </section>
    </PageShell>
  )
}
