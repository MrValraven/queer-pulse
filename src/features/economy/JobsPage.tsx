import { useMemo, useState, type SyntheticEvent } from 'react'
import { FiCheck } from 'react-icons/fi'
import { FaRainbow } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Reveal, SectionHead } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { JOBS, JOB_FILTERS, EMPLOYERS, type Job } from './jobs.data'
import styles from './JobsPage.module.css'

function JobCard({ job }: { job: Job }) {
  const { showToast } = useToast()
  const [applied, setApplied] = useState(false)

  function apply(e: SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (applied) return
    setApplied(true)
    showToast(`Application started for ${job.title}`, 'success')
  }

  return (
    <Link to={`${routes.jobs}/${job.slug}`} className={styles.card}>
      <div className={styles.logo} style={{ background: job.logoBg, color: job.logoText }}>
        {job.logo}
      </div>
      <div className={styles.cBody}>
        <div className={styles.cHead}>
          <div className={styles.title}>{job.title}</div>
          <div className={styles.salary}>{job.salary}</div>
        </div>
        <div className={styles.org}>{job.org}</div>
        <div className={styles.tags}>
          <span
            className={styles.qr}
            style={{
              background: job.qr ? 'rgba(74,140,111,.1)' : 'rgba(45,27,61,.06)',
              color: job.qr ? 'var(--jade)' : 'var(--ink-60)',
            }}
          >
            {job.qr ? <><FaRainbow /> </> : ''}
            {job.qrLabel}
          </span>
          {job.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.desc}>{job.desc}</div>
        <div className={styles.meta}>
          <span>{job.type}</span>
          <span className={styles.dot} />
          <span>{job.location}</span>
          <span className={styles.dot} />
          <span>Apply by {job.deadline}</span>
        </div>
      </div>
      <span
        role="button"
        tabIndex={0}
        aria-disabled={applied}
        className={[styles.apply, applied && styles.applyDone].filter(Boolean).join(' ')}
        onClick={apply}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') apply(e)
        }}
      >
        {applied ? <>Applied <FiCheck /></> : 'Apply'}
      </span>
    </Link>
  )
}

export function JobsPage() {
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')
  const visible = useMemo(() => (filter === 'all' ? JOBS : JOBS.filter((j) => j.cat === filter)), [filter])

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Job Board
          </Reveal>
          <Reveal as="h1" delay={60}>
            Work that <em>doesn't ask you to hide.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            Queer-run businesses and verified queer-inclusive employers — jobs where you can show up
            as yourself. No rainbow capitalism. Every listing is vetted by the community.
          </Reveal>
          <Reveal className={styles.badges} delay={160}>
            <span className={styles.badge}><FaRainbow /> Queer-run</span>
            <span className={styles.badge}><FiCheck /> Community verified</span>
            <span className={styles.badge}>Lisbon + remote</span>
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <div className={styles.filters}>
              {JOB_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={[styles.chip, filter === f.value && styles.chipActive].filter(Boolean).join(' ')}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button className={styles.postBtn} onClick={() => showToast('Job submitted for review', 'info')}>
              + Post a job
            </button>
          </div>
          <div className={styles.list}>
            {visible.map((job) => (
              <JobCard key={job.slug} job={job} />
            ))}
          </div>
        </div>
      </div>

      <section className={styles.employers}>
        <div className="wrap">
          <SectionHead
            title={<>Queer-run employers <em>we trust</em></>}
            subtitle="These organisations are run by or for the queer community. Working here means your money stays in the network."
          />
          <div className={styles.empGrid}>
            {EMPLOYERS.map((emp) => (
              <div key={emp.name} className={styles.empCard}>
                <div className={styles.empLogo} style={{ background: emp.bg, color: emp.text }}>
                  {emp.logo}
                </div>
                <div className={styles.empName}>{emp.name}</div>
                <div className={styles.empType}>{emp.type}</div>
                <span className={styles.empBadge} style={{ background: emp.badgeBg, color: emp.badgeText }}>
                  {emp.qr ? <><FaRainbow /> </> : ''}
                  {emp.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
