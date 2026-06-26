import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  BADGE_CLASS,
  INC_MENTORS,
  SALARIES,
  SAL_FILTERS,
  STEPS,
  TOOLS,
  euro,
  type Sector,
} from './economy.data'
import { SalarySubmitModal } from './SalarySubmitModal'
import styles from './EconomyPage.module.css'

export function IncubatorTab() {
  const { showToast } = useToast()
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
            <Button type="button" variant="primary" onClick={() => showToast('Cohort 3 application opening…', 'info')}>
              Apply for cohort 3
            </Button>
            <Button type="button" variant="ghost-dark" onClick={() => showToast('Mentor sign-up opening…', 'info')} style={{ fontSize: 14 }}>
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
            {INC_MENTORS.map((m) => (
              <div className={styles.mentorCard} key={m.name}>
                <div className={styles.mentorTop}>
                  <div className={styles.mentorAv} style={{ background: m.bg, color: m.color }}>
                    {m.av}
                  </div>
                  <div>
                    <div className={styles.mentorName}>{m.name}</div>
                    <div className={styles.mentorRole}>{m.role}</div>
                  </div>
                </div>
                <div className={styles.mentorTags}>
                  {m.tags.map((t) => (
                    <span key={t} className={styles.mentorTag}>
                      {t}
                    </span>
                  ))}
                </div>
                <button type="button" className={styles.mentorBtn} onClick={() => showToast('Session requested', 'success')}>
                  Request session
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export function FreelanceTab() {
  const { showToast } = useToast()
  const [annual, setAnnual] = useState('40000')
  const [days, setDays] = useState('180')
  const [overhead, setOverhead] = useState('20')
  const [iva, setIva] = useState('23')

  const base = ((parseFloat(annual) || 0) / (parseFloat(days) || 1)) * (1 + (parseFloat(overhead) || 0) / 100)
  const withIva = base * (1 + (parseFloat(iva) || 0) / 100)

  return (
    <>
      <div className={styles.secHeader}>
        <div>
          <h2 className={styles.econH}>
            Freelance <em>tools.</em>
          </h2>
          <p className={styles.econSub}>
            Templates, calculators, and guides written by and for queer freelancers in Portugal.
            Free, no sign-up needed.
          </p>
        </div>
      </div>
      <div className={styles.toolsGrid}>
        {TOOLS.map((t) => (
          <div className={styles.toolCard} key={t.title}>
            <div className={styles.toolIcon}><t.icon /></div>
            <div className={styles.toolTitle}>{t.title}</div>
            <div className={styles.toolDesc}>{t.desc}</div>
            <button type="button" className={styles.toolCtaBtn} onClick={() => showToast(`${t.cta}…`, 'info')}>
              {t.cta}
            </button>
          </div>
        ))}
      </div>

      <h3 className={styles.rateH}>
        Day rate <em>calculator.</em>
      </h3>
      <div className={styles.rateCalc}>
        <div className={styles.rcRow}>
          <div>
            <div className={styles.rcLabel}>Target annual income (€)</div>
            <input className={styles.rcInput} type="number" value={annual} onChange={(e) => setAnnual(e.target.value)} />
          </div>
          <div>
            <div className={styles.rcLabel}>Billable days per year</div>
            <input className={styles.rcInput} type="number" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
        </div>
        <div className={styles.rcRow}>
          <div>
            <div className={styles.rcLabel}>Overhead &amp; expenses (% of income)</div>
            <input className={styles.rcInput} type="number" min={0} max={100} value={overhead} onChange={(e) => setOverhead(e.target.value)} />
          </div>
          <div>
            <div className={styles.rcLabel}>IVA rate</div>
            <select className={styles.rcSelect} value={iva} onChange={(e) => setIva(e.target.value)}>
              <option value="0">0% (exempt)</option>
              <option value="6">6%</option>
              <option value="13">13%</option>
              <option value="23">23%</option>
            </select>
          </div>
        </div>
        <div className={styles.rcResult}>
          <div>
            <div className={styles.rcResultLabel}>Minimum day rate (excl. IVA)</div>
            <div className={styles.rcResultVal}>{euro(base)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={styles.rcResultLabel}>Including IVA</div>
            <div className={styles.rcResultVal}>{euro(withIva)}</div>
          </div>
        </div>
      </div>
      <p className={styles.rateNote}>
        A starting point only — adjust for your sector, experience, and market. See the salary board
        for what others in similar roles charge.
      </p>
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
        {salaries.map((s, i) => (
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
        ))}
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
