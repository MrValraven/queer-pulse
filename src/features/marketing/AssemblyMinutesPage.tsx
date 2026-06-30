import { useParams, Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { AssemblyMinutesBody } from './AssemblyMinutesBody'
import { MINUTES, MINUTES_FALLBACK_YEAR } from './assemblyMinutes.data'
import styles from './AssemblyMinutesPage.module.css'

export function AssemblyMinutesPage() {
  const { year } = useParams<{ year: string }>()
  const minutes = (year && MINUTES[year]) || MINUTES[MINUTES_FALLBACK_YEAR]
  const exact = Boolean(year && MINUTES[year])

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            Annual Assembly · Minutes · {minutes.year}
          </div>
          <h1 className={styles.h1}>
            The <em>minutes.</em>
          </h1>
          <p className={styles.dek}>
            The public record of the {minutes.year} Annual Assembly — who chaired, what was on the
            table, and how every resolution landed.{' '}
            {!exact && (
              <em>
                We don't have minutes for {year} on file, so here's the {minutes.year} record
                instead.
              </em>
            )}
          </p>
          <div className={styles.actions}>
            <Button to={routes.annualAssembly} variant="ghost">
              ← Back to the Assembly
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.page}>
        <AssemblyMinutesBody minutes={minutes} />

        <div className={styles.otherYears}>
          <span>Other years:</span>
          {Object.keys(MINUTES)
            .sort()
            .reverse()
            .map((y) => (
              <Link
                key={y}
                to={`${routes.annualAssembly}/minutes/${y}`}
                className={y === minutes.year ? styles.yearActive : styles.year}
              >
                {y}
              </Link>
            ))}
        </div>
      </div>
    </PageShell>
  )
}
