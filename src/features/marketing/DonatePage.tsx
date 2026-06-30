import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro, Reveal } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { DonateModal } from './DonateModal'
import { ALLOCATION, AMOUNTS, TRUST } from './donate.data'
import styles from './DonatePage.module.css'

export function DonatePage() {
  const [monthly, setMonthly] = useState(true)
  const [selected, setSelected] = useState(1)
  const [giving, setGiving] = useState(false)

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>Support QueerPulse</Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            Members keep this <em>alive.</em>
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            No ads, no investors, no data sold. QueerPulse runs on the people who use it — and every
            euro goes back into mutual aid, gatherings, and paying queer creatives fairly.
          </Reveal>

          <Reveal className={styles.card} delay={160}>
            <div className={styles.toggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${monthly ? styles.toggleOn : ''}`}
                onClick={() => setMonthly(true)}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!monthly ? styles.toggleOn : ''}`}
                onClick={() => setMonthly(false)}
              >
                One-off
              </button>
            </div>
            <div className={styles.amounts}>
              {AMOUNTS.map((amount, index) => (
                <button
                  key={amount.value}
                  type="button"
                  className={`${styles.amount} ${selected === index ? styles.amountOn : ''}`}
                  onClick={() => setSelected(index)}
                >
                  {amount.featured && <span className={styles.ribbon}>{amount.note}</span>}
                  <div className={styles.amountVal}>{amount.value}</div>
                  {!amount.featured && <div className={styles.amountNote}>{amount.note}</div>}
                </button>
              ))}
            </div>
            <Button
              variant="jade"
              size="lg"
              onClick={() => setGiving(true)}
              style={{ width: '100%' }}
            >
              Give {AMOUNTS[selected]!.value}
              {monthly ? ' / month' : ''} →
            </Button>
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            Where it <em>actually goes.</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            Not overheads and salaries for people you'll never meet. Here's the real split.
          </Reveal>
          <div className={styles.alloc}>
            {ALLOCATION.map((row, index) => (
              <Reveal key={row.label} className={styles.allocRow} delay={index * 50}>
                <div className={styles.allocPct}>{row.pct}</div>
                <div>
                  <div className={styles.allocLabel}>{row.label}</div>
                  <div className={styles.allocBody}>{row.body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            You can <em>trust the numbers.</em>
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            Transparency isn't a nice-to-have here — it's the deal.
          </Reveal>
          <div className={styles.trust}>
            {TRUST.map((item, index) => (
              <Reveal key={item.title} className={styles.trustCard} delay={index * 55}>
                <div className={styles.trustIcon}><item.icon /></div>
                <div className={styles.trustTitle}>{item.title}</div>
                <div className={styles.trustBody}>{item.body}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={<>Or give your <em>time instead.</em></>}
        sub="Money is one way in. Volunteering, hosting, and showing up are just as much the point."
      >
        <Button to={routes.volunteer} variant="primary" size="lg">
          Volunteer with us
        </Button>
        <Button to={routes.transparencyReport} variant="ghost-dark" size="lg">
          Read the figures
        </Button>
      </Outro>

      {giving && (
        <DonateModal
          amount={AMOUNTS[selected]!.value}
          monthly={monthly}
          onClose={() => setGiving(false)}
        />
      )}
    </PageShell>
  )
}
