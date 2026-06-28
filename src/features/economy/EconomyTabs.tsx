import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiDollarSign } from 'react-icons/fi'
import { Avatar, Button, EmptyState } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { fullName, getMember } from '../members/data/members'
import {
  BADGE_CLASS,
  CALC_TOOLS,
  COMMUNITY_TOOLS,
  INC_MENTORS,
  SALARIES,
  SAL_FILTERS,
  STEPS,
  TOOLS,
  type Sector,
  type ToolCard,
} from './economy.data'
import { SalarySubmitModal } from './SalarySubmitModal'
import { CohortApplyModal, MentorSignupModal, RequestSessionModal } from './IncubatorModals'
import styles from './EconomyPage.module.css'

export function IncubatorTab() {
  const [modal, setModal] = useState<'cohort' | 'mentor' | null>(null)
  const [session, setSession] = useState<(typeof INC_MENTORS)[number] | null>(null)
  return (
    <>
      <div className={styles.incHeroBox}>
        <div>
          <div className={styles.incH}>
            A space to build <em>your</em> thing.
          </div>
          <p className={styles.incP}>
            The QueerPulse incubator supports queer founders in Lisbon with six months of structured
            mentorship, peer accountability, and connections to investors and collaborators who get it.
          </p>
          <div className={styles.incBtns}>
            <Button type="button" variant="primary" onClick={() => setModal('cohort')}>
              Apply for cohort 3
            </Button>
            <Button type="button" variant="ghost-dark" onClick={() => setModal('mentor')} style={{ fontSize: 14 }}>
              Become a mentor
            </Button>
          </div>
        </div>
        <div className={styles.incStats}>
          <div className={styles.incStat}>
            <div className={styles.n}>24</div>
            <div className={styles.l}>founders in 2 cohorts</div>
          </div>
          <div className={styles.incStat}>
            <div className={styles.n}>18</div>
            <div className={styles.l}>mentors from the community</div>
          </div>
          <div className={styles.incStat}>
            <div className={styles.n}>€2.4M</div>
            <div className={styles.l}>raised by cohort alumni</div>
          </div>
        </div>
      </div>

      <div className={styles.incCols}>
        <div>
          <h3 className={styles.colH}>
            How the programme <em>works.</em>
          </h3>
          <div className={styles.incTimeline}>
            {STEPS.map((s) => (
              <div className={styles.incStep} key={s.n}>
                <div className={styles.incStepNum}>{s.n}</div>
                <div className={styles.incStepBody}>
                  <div className={styles.incStepTitle}>{s.title}</div>
                  <div className={styles.incStepDesc}>{s.desc}</div>
                  <div className={styles.incStepMeta}>{s.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className={styles.colH}>
            Current <em>mentors.</em>
          </h3>
          <div className={styles.mentorGrid}>
            {INC_MENTORS.map((m) => {
              const member = getMember(m.slug)
              if (!member) return null
              return (
                <div className={styles.mentorCard} key={m.slug}>
                  <div className={styles.mentorTop}>
                    <Avatar
                      initials={member.initials}
                      tint={member.tint}
                      src={member.photo}
                      verified={member.verified}
                      size={50}
                    />
                    <div>
                      <Link to={`/members/${member.slug}`} className={styles.mentorName}>
                        {fullName(member)}
                      </Link>
                      <div className={styles.mentorRole}>{member.role}</div>
                    </div>
                  </div>
                  <div className={styles.mentorTags}>
                    {m.tags.map((t) => (
                      <span key={t} className={styles.mentorTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <button type="button" className={styles.mentorBtn} onClick={() => setSession(m)}>
                    Request session
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {modal === 'cohort' && <CohortApplyModal onClose={() => setModal(null)} />}
      {modal === 'mentor' && <MentorSignupModal onClose={() => setModal(null)} />}
      {session &&
        (() => {
          const member = getMember(session.slug)
          if (!member) return null
          return (
            <RequestSessionModal
              mentorName={fullName(member)}
              mentorRole={member.role}
              onClose={() => setSession(null)}
            />
          )
        })()}
    </>
  )
}

/** A grid of launcher cards linking out to the real tool pages. */
function ToolGrid({ tools }: { tools: ToolCard[] }) {
  return (
    <div className={styles.toolsGrid}>
      {tools.map((t) => (
        <Link className={styles.toolCard} key={t.title} to={t.to}>
          <div className={styles.toolIcon}><t.icon /></div>
          <div className={styles.toolTitle}>{t.title}</div>
          <div className={styles.toolDesc}>{t.desc}</div>
          <span className={styles.toolCtaBtn}>{t.cta} →</span>
        </Link>
      ))}
    </div>
  )
}

export function FreelanceTab() {
  return (
    <>
      <div className={styles.secHeader}>
        <div>
          <h2 className={styles.econH}>
            Freelance <em>tools.</em>
          </h2>
          <p className={styles.econSub}>
            Real, working tools — built by and for queer freelancers in Portugal. Free, no sign-up,
            and nothing you enter leaves your device.
          </p>
        </div>
      </div>

      <h3 className={styles.rateH}>
        Documents that <em>get you paid.</em>
      </h3>
      <ToolGrid tools={TOOLS} />

      <h3 className={styles.rateH}>
        Know your <em>numbers.</em>
      </h3>
      <ToolGrid tools={CALC_TOOLS} />

      <h3 className={styles.rateH}>
        Stronger <em>together.</em>
      </h3>
      <ToolGrid tools={COMMUNITY_TOOLS} />
    </>
  )
}

export function SalaryTab() {
  const { showToast } = useToast()
  const [sector, setSector] = useState<Sector | 'all'>('all')
  const [modal, setModal] = useState(false)
  const salaries = SALARIES.filter((s) => sector === 'all' || s.sector === sector)

  return (
    <>
      <div className={styles.secHeader}>
        <div>
          <h2 className={styles.econH}>
            Salary <em>transparency.</em>
          </h2>
          <p className={styles.econSub}>
            Anonymous submissions from the community. Filter by sector, role, or type. Knowledge is
            power.
          </p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setModal(true)}>
          + Submit yours
        </button>
      </div>
      <div className={styles.salFilters}>
        {SAL_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={[styles.salChip, sector === f.id && styles.salChipActive].filter(Boolean).join(' ')}
            onClick={() => setSector(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={styles.salTable}>
        <div className={styles.salHeader}>
          <div className={styles.salHcell}>Role</div>
          <div className={styles.salHcell}>Annual (gross)</div>
          <div className={styles.salHcell}>Experience</div>
          <div className={`${styles.salHcell} ${styles.salTypeCol}`}>Type</div>
        </div>
        {salaries.length === 0 ? (
          <EmptyState
            compact
            icon={<FiDollarSign />}
            title="No entries in this sector yet"
            description="Nothing's been shared for this sector so far. Clear the filter to see every submission — or add yours to help the next person negotiate."
            action={{ label: 'Clear filters', onClick: () => setSector('all') }}
          />
        ) : (
          salaries.map((s, i) => (
            <div className={styles.salRow} key={i}>
              <div>
                <div className={styles.salRole}>{s.role}</div>
                <div className={styles.salSector}>{s.sectorLabel}</div>
              </div>
              <div className={`${styles.salCell} ${styles.salMoney}`}>{s.money}</div>
              <div className={styles.salCell}>
                <span className={styles.salExp}>{s.exp}</span>
              </div>
              <div className={`${styles.salCell} ${styles.salTypeCol}`}>
                <span className={`${styles.salBadge} ${styles[BADGE_CLASS[s.type]]}`}>{s.typeLabel}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className={styles.salAnon}>
        All entries are anonymous. No name, email, or employer is stored. Entries are reviewed by a
        moderator before appearing.
      </div>
      <div className={styles.salSubmitBox}>
        <p>
          Help the community by sharing what you earn. The more entries, the more useful this becomes
          for everyone — especially people just starting to negotiate.
        </p>
        <button type="button" className={styles.primaryBtn} onClick={() => setModal(true)}>
          Submit your salary
        </button>
      </div>

      {modal && (
        <SalarySubmitModal
          onClose={() => setModal(false)}
          onSubmit={() => {
            setModal(false)
            showToast('Submitted anonymously — thank you', 'success')
          }}
        />
      )}
    </>
  )
}
