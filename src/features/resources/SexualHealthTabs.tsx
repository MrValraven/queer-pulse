import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import {
  CLINICS,
  CLINIC_FILTERS,
  GUIDES,
  HIV_INFO,
  PREP_FAQ,
  PREP_STEPS,
  TESTING_INFO,
  TYPE_CLASS,
  type ClinicType,
} from './sexualHealth.data'
import styles from './SexualHealthPage.module.css'

export function TestingTab() {
  const { showToast } = useToast()
  const [clinicFilter, setClinicFilter] = useState<ClinicType | 'all'>('all')
  const clinics = CLINICS.filter((c) => clinicFilter === 'all' || c.type === clinicFilter)

  return (
    <>
      <h2 className={styles.h}>
        Where to get <em>tested</em> in Lisbon.
      </h2>
      <p className={styles.sub}>Community-reviewed clinics and services. Last updated by members June 2025.</p>
      <div className={styles.infoGrid}>
        {TESTING_INFO.map((c) => (
          <div key={c.title} className={styles.infoCard} style={{ background: c.bg, borderColor: c.border }}>
            <div className={styles.infoIcon}>{c.icon}</div>
            <div className={styles.infoTitle} style={{ color: c.color }}>
              {c.title}
            </div>
            <div className={styles.infoBody}>{c.body}</div>
          </div>
        ))}
      </div>

      <div className={styles.clinicFilters}>
        {CLINIC_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={[styles.cChip, clinicFilter === f.id && styles.cChipActive].filter(Boolean).join(' ')}
            onClick={() => setClinicFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.clinicList}>
        {clinics.map((c) => (
          <div className={styles.clinicCard} key={c.name}>
            <div>
              <div className={`${styles.ccType} ${styles[TYPE_CLASS[c.type]]}`}>{c.typeLabel}</div>
              <div className={styles.ccName}>{c.name}</div>
              <div className={styles.ccDesc}>{c.desc}</div>
              <div className={styles.ccMeta}>
                {c.meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
            <div className={styles.ccRight}>
              {c.verified && <div className={styles.ccBadge}>Community verified ✓</div>}
              <button type="button" className={styles.ccBtn} onClick={() => showToast('Opening details…', 'info')}>
                {c.btn}
              </button>
              {c.review && <div className={styles.ccReview}>{c.review}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.anonBox}>
        <h3>Know a service we should add?</h3>
        <p>Nominate a clinic or service for community review. We verify every listing before it goes live.</p>
        <input
          className={styles.anonInput}
          style={{ minHeight: 52, resize: 'none' }}
          placeholder="Clinic name, location, and why you'd recommend it…"
        />
        <div style={{ marginTop: 12 }}>
          <button type="button" className={styles.primaryBtn} onClick={() => showToast('Nomination submitted', 'success')}>
            Submit nomination
          </button>
        </div>
      </div>
    </>
  )
}

export function PrepTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return (
    <>
      <h2 className={styles.h}>
        PrEP in <em>Portugal.</em>
      </h2>
      <p className={styles.sub}>
        PrEP (pre-exposure prophylaxis) is available free through the SNS for eligible people. When
        taken correctly it is over 99% effective at preventing HIV. Here's how to access it.
      </p>
      <div className={styles.tip}>
        <div className={styles.tipIcon}>💡</div>
        <div className={styles.tipText}>
          <strong>Portugal was one of the first European countries to make PrEP free.</strong> You
          don't need private insurance. The process involves a simple eligibility check, blood tests,
          and a prescription — the whole pathway takes about 4–6 weeks the first time.
        </div>
      </div>
      <div className={styles.prepSteps}>
        {PREP_STEPS.map((s, i) => (
          <div className={styles.prepStep} key={s.title}>
            <div className={styles.psNum}>{i + 1}</div>
            <div className={styles.psBody}>
              <div className={styles.psTitle}>{s.title}</div>
              <div className={styles.psDesc}>{s.desc}</div>
              {s.note && <div className={styles.psNote}>{s.note}</div>}
            </div>
          </div>
        ))}
      </div>
      <h3 className={styles.subHead}>
        Common <em>questions.</em>
      </h3>
      <div className={styles.faq}>
        {PREP_FAQ.map((f, i) => (
          <div key={f.q} className={[styles.faqItem, openFaq === i && styles.faqItemOpen].filter(Boolean).join(' ')}>
            <button type="button" className={styles.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span className={styles.faqQText}>{f.q}</span>
              <span className={styles.faqArrow}>+</span>
            </button>
            {openFaq === i && <div className={styles.faqA}>{f.a}</div>}
          </div>
        ))}
      </div>
    </>
  )
}

export function HivTab() {
  return (
    <>
      <h2 className={styles.h}>
        HIV — what you need to <em>know.</em>
      </h2>
      <p className={styles.sub}>
        Honest, current information. HIV is a manageable condition. With treatment, people with HIV
        live full, long lives and can't pass the virus on.
      </p>
      <div className={styles.hivBanner}>
        <h3>
          Undetectable = <em>Untransmittable.</em>
        </h3>
        <p>
          U=U is one of the most important facts in sexual health. People living with HIV who are on
          effective treatment and have an undetectable viral load cannot sexually transmit HIV to
          their partners. This is scientifically established and endorsed by every major health
          authority.
        </p>
        <div className={styles.hivStats}>
          <div className={styles.hivStat}>
            <div className={styles.n}>U=U</div>
            <div className={styles.l}>Undetectable = Untransmittable. Confirmed by the CDC, WHO, and 400+ health organisations globally.</div>
          </div>
          <div className={styles.hivStat}>
            <div className={styles.n}>97%</div>
            <div className={styles.l}>of people on treatment in Portugal achieve an undetectable viral load within 6 months.</div>
          </div>
          <div className={styles.hivStat}>
            <div className={styles.n}>Free</div>
            <div className={styles.l}>HIV treatment (antiretrovirals) is free for all residents through the SNS.</div>
          </div>
        </div>
        <div className={styles.hivBtns}>
          <Button to={routes.communities} variant="primary">
            Find HIV support services
          </Button>
        </div>
      </div>
      <div className={styles.infoGrid}>
        {HIV_INFO.map((c) => (
          <div className={styles.infoCard} key={c.title}>
            <div className={styles.infoIcon}>{c.icon}</div>
            <div className={styles.infoTitle}>{c.title}</div>
            <div className={styles.infoBody}>{c.body}</div>
            {c.link &&
              (c.link.external ? (
                <a href={c.link.href} className={styles.infoLink}>
                  {c.link.label}
                </a>
              ) : (
                <Link to={c.link.href} className={styles.infoLink}>
                  {c.link.label}
                </Link>
              ))}
          </div>
        ))}
      </div>
    </>
  )
}

export function GuidesTab() {
  const { showToast } = useToast()
  return (
    <>
      <h2 className={styles.h}>
        Guides &amp; <em>questions.</em>
      </h2>
      <p className={styles.sub}>
        Short guides and a place to ask anything anonymously. Answered by community members with
        relevant experience — not bots.
      </p>
      <div className={styles.infoGrid}>
        {GUIDES.map((g) => (
          <div className={styles.infoCard} key={g.title}>
            <div className={styles.infoIcon}>{g.icon}</div>
            <div className={styles.infoTitle}>{g.title}</div>
            <div className={styles.infoBody}>{g.body}</div>
            {g.link &&
              (g.link.href === '#' ? (
                <span className={styles.infoLink}>{g.link.label}</span>
              ) : (
                <Link to={g.link.href} className={styles.infoLink}>
                  {g.link.label}
                </Link>
              ))}
          </div>
        ))}
      </div>
      <div className={styles.anonBox}>
        <h3>Ask anything — anonymously.</h3>
        <p>
          Submit a question to the community. Answered by members with relevant knowledge. Nothing is
          shared or linked to your account.
        </p>
        <textarea className={styles.anonInput} placeholder="Your question — no detail is too small or too embarrassing…" />
        <div className={styles.anonFoot}>
          <span className={styles.anonNote}>Completely anonymous. No account required.</span>
          <button type="button" className={styles.primaryBtn} onClick={() => showToast('Question submitted anonymously', 'success')}>
            Submit question
          </button>
        </div>
      </div>
    </>
  )
}
