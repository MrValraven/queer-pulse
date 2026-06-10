import { useMemo, useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Reveal, SectionHead } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './JobsPage.module.css'

interface Job {
  cat: string
  qr: boolean
  qrLabel: string
  org: string
  logo: string
  logoBg: string
  logoText: string
  title: string
  type: string
  location: string
  salary: string
  deadline: string
  desc: string
  tags: string[]
}

const JOBS: Job[] = [
  { cat: 'design', qr: true, qrLabel: 'Queer-run', org: 'Atelier Pulso', logo: 'AP', logoBg: 'rgba(232,119,90,.14)', logoText: 'var(--accent-ink)', title: 'Junior Graphic Designer', type: 'Full-time', location: 'Príncipe Real · In-person', salary: '€1,200–1,500/mo', deadline: '30 Jun', desc: 'Inês is building out her studio. Looking for a junior designer who cares about type, editorial systems, and making beautiful things. Training provided.', tags: ['Graphic design', 'Type', 'Branding'] },
  { cat: 'community', qr: true, qrLabel: 'Queer-led', org: 'ILGA Portugal', logo: 'IL', logoBg: 'rgba(122,82,184,.12)', logoText: '#7A52B8', title: 'Community Outreach Coordinator', type: 'Full-time', location: 'Intendente · In-person', salary: '€1,100–1,300/mo', deadline: '15 Jul', desc: "Coordinate ILGA Portugal's community outreach programmes across Lisbon. Manage volunteers, build partnerships. Portuguese required.", tags: ['Community', 'Outreach', 'Advocacy'] },
  { cat: 'tech', qr: false, qrLabel: 'Queer-inclusive', org: 'A Lisbon Fintech', logo: 'FT', logoBg: 'rgba(45,27,61,.08)', logoText: 'var(--plum)', title: 'Backend Engineer (Rust/Go)', type: 'Full-time · Hybrid', location: 'Marvila · Hybrid', salary: '€2,800–3,800/mo', deadline: 'Open', desc: 'Growing Lisbon fintech with a strong LGBTQ+ ERG and a genuine commitment to inclusion. Looking for a mid-level backend engineer.', tags: ['Backend', 'Rust', 'Go', 'Fintech'] },
  { cat: 'arts', qr: true, qrLabel: 'Queer-run', org: 'Rainbow Arts Collective', logo: 'RA', logoBg: 'rgba(232,119,90,.1)', logoText: 'var(--accent-ink)', title: 'Programme Coordinator (Part-time)', type: 'Part-time', location: 'Lisbon · Flexible', salary: '€700/mo', deadline: '20 Jun', desc: 'Help coordinate Rainbow Arts Collective exhibitions, events, and residencies. 20 hours per week.', tags: ['Arts admin', 'Programming', 'Events'] },
  { cat: 'care', qr: true, qrLabel: 'Community org', org: 'Opus Diversus', logo: 'OD', logoBg: 'rgba(74,140,111,.12)', logoText: 'var(--jade)', title: 'Peer Support Facilitator', type: 'Part-time', location: 'Lisbon · In-person', salary: '€900/mo', deadline: 'Open', desc: 'Facilitate peer support groups for LGBTQ+ people in Lisbon. Lived experience matters more than formal qualifications.', tags: ['Mental health', 'Peer support', 'Facilitation'] },
  { cat: 'food', qr: true, qrLabel: 'Queer-run', org: 'Livraria Devagar', logo: 'LB', logoBg: 'rgba(232,119,90,.1)', logoText: 'var(--accent-ink)', title: 'Bookseller · Part-time', type: 'Part-time', location: 'Anjos · In-person', salary: '€800/mo', deadline: '15 Jul', desc: "Opening September 2026. We're looking for someone who loves queer literature and wants to help build something new in Anjos.", tags: ['Bookshop', 'Retail', 'Community'] },
]

const FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: 'design', label: 'Design' },
  { value: 'tech', label: 'Tech' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'care', label: 'Care' },
  { value: 'food', label: 'Food' },
  { value: 'community', label: 'Community' },
]

const EMPLOYERS = [
  { logo: 'AP', bg: 'rgba(232,119,90,.12)', text: 'var(--accent-ink)', name: 'Atelier Pulso', type: 'Design studio · Príncipe Real', badge: '🏳️‍🌈 Queer-run', badgeBg: 'rgba(232,119,90,.1)', badgeText: 'var(--accent-ink)' },
  { logo: 'QP', bg: 'rgba(74,140,111,.12)', text: 'var(--jade)', name: 'QueerPulse', type: 'Community platform · Lisbon', badge: '🏳️‍🌈 Queer-run', badgeBg: 'rgba(74,140,111,.1)', badgeText: 'var(--jade)' },
  { logo: 'IL', bg: 'rgba(122,82,184,.1)', text: '#7A52B8', name: 'ILGA Portugal', type: 'NGO · Intendente', badge: '🏳️‍🌈 Queer-led', badgeBg: 'rgba(122,82,184,.08)', badgeText: '#7A52B8' },
  { logo: 'OD', bg: 'rgba(45,27,61,.08)', text: 'var(--plum)', name: 'Opus Diversus', type: 'Mental health · Lisbon', badge: 'Community org', badgeBg: 'rgba(45,27,61,.06)', badgeText: 'var(--plum)' },
  { logo: 'LB', bg: 'rgba(232,119,90,.1)', text: 'var(--accent-ink)', name: 'Livraria Devagar', type: 'Bookshop · Anjos', badge: '🏳️‍🌈 Queer-friendly', badgeBg: 'rgba(232,119,90,.1)', badgeText: 'var(--accent-ink)' },
]

function JobCard({ job }: { job: Job }) {
  const { showToast } = useToast()
  const [applied, setApplied] = useState(false)
  return (
    <div className={styles.card}>
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
            {job.qr ? '🏳️‍🌈 ' : ''}
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
      <button
        className={[styles.apply, applied && styles.applyDone].filter(Boolean).join(' ')}
        onClick={() => {
          setApplied(true)
          showToast(`Application started for ${job.title}`, 'success')
        }}
        disabled={applied}
      >
        {applied ? 'Applied ✓' : 'Apply'}
      </button>
    </div>
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
            <span className={styles.badge}>🏳️‍🌈 Queer-run</span>
            <span className={styles.badge}>✓ Community verified</span>
            <span className={styles.badge}>Lisbon + remote</span>
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <div className={styles.filters}>
              {FILTERS.map((f) => (
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
              <JobCard key={job.title} job={job} />
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
