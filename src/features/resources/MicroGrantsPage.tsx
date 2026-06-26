import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, Outro } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { CRITERIA, CURRENT, HOW, PANEL, PAST, RULES } from './microGrants.data'
import { GrantCard } from './GrantCard'
import { GrantApplicationModal } from './GrantApplicationModal'
import { ContributeStrip, MicroGrantsHero } from './MicroGrantsSections'
import styles from './MicroGrantsPage.module.css'

const INVITE = routes.invite

export function MicroGrantsPage() {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)

  return (
    <PageShell>
      <MicroGrantsHero />

      <section className={styles.howSection}>
        <div className="wrap">
          <div className={styles.howGrid}>
            {HOW.map((h) => (
              <div className={styles.howItem} key={h.n}>
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{h.title}</div>
                <div className={styles.howBody}>{h.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.roundCard}>
                <div className={styles.rcLabel}>
                  <span className={styles.rcDot} />
                  Applications open · Q2 2026
                </div>
                <div className={styles.rcTitle}>
                  This round: <em>Making things together.</em>
                </div>
                <p className={styles.rcDesc}>
                  This quarter we are prioritising projects that create something — events,
                  publications, spaces, tools — that the wider queer community in Lisbon can access
                  and benefit from. Solo projects and collaborations both welcome.
                </p>
                <div className={styles.rcMeta}>
                  <div className={styles.rcm}>
                    <strong>€200 – €2,000</strong>
                    <span>per project</span>
                  </div>
                  <div className={styles.rcm}>
                    <strong>30 June 2026</strong>
                    <span>application deadline</span>
                  </div>
                  <div className={styles.rcm}>
                    <strong>3 – 4 weeks</strong>
                    <span>to decision</span>
                  </div>
                </div>
                <div className={styles.rcCriteria}>
                  <div className={styles.rcCritTitle}>Criteria</div>
                  <div className={styles.critList}>
                    {CRITERIA.map((c) => (
                      <div className={styles.crit} key={c}>
                        <span className={styles.critCheck}><FiCheck /></span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="button" variant="primary" onClick={() => setOpen(true)}>
                  Apply for this round
                </Button>
              </div>

              <div className={styles.grantsSection}>
                <div className={styles.gsHead}>
                  Current <em>recipients</em>
                </div>
                <div className={styles.grantsGrid}>
                  {CURRENT.map((g) => (
                    <GrantCard g={g} key={g.name} />
                  ))}
                </div>
              </div>

              <div className={styles.grantsSection}>
                <div className={styles.gsHead}>
                  Past <em>projects</em>
                </div>
                <div className={styles.grantsGrid}>
                  {PAST.map((g) => (
                    <GrantCard g={g} key={g.name} />
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>Grant rules</div>
                {RULES.map((r) => (
                  <div className={styles.sbcRule} key={r.title}>
                    <div className={styles.sbcRuleTitle}>{r.title}</div>
                    <div className={styles.sbcRuleBody}>{r.body}</div>
                  </div>
                ))}
              </div>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>Review panel — Q2 2026</div>
                {PANEL.map((p) => (
                  <div className={styles.sbcRule} key={p.title}>
                    <div className={styles.sbcRuleTitle}>{p.title}</div>
                    <div className={styles.sbcRuleBody}>{p.body}</div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                className={styles.sbcBtn}
                onClick={() => showToast('Opening panel sign-up…', 'info')}
              >
                Join the review panel →
              </Button>
            </aside>
          </div>

          <ContributeStrip />
        </div>
      </main>

      <Outro
        title={<>The community <em>funds itself.</em></>}
        sub="Every project here was made possible by members contributing what they could spare. The fund grows with the network."
      >
        <Button to={INVITE} variant="primary" size="lg">
          Join the network
        </Button>
      </Outro>

      {open && <GrantApplicationModal onClose={() => setOpen(false)} />}
    </PageShell>
  )
}
