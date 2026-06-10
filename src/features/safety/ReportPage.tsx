import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import s from './ReportPage.module.css'

const FLOW = [
  { n: '01', title: 'You submit a report', desc: 'Via the button on any profile, message, or forum post — or directly through this page. You can report anonymously if needed.' },
  { n: '02', title: 'Immediate acknowledgement', desc: 'You receive a confirmation within 1 hour. A real person is assigned to your report — not an automated queue.' },
  { n: '03', title: 'Review within 24 hours', desc: "We review the evidence, context, and history. For serious cases, the reported member's access is temporarily suspended during review." },
  { n: '04', title: 'Decision & action', desc: 'Possible outcomes: warning, temporary suspension, permanent removal. We communicate the outcome to you — with reasoning.' },
]

const PRINCIPLES = [
  ['We believe the reporter first.', 'Our default is to take reports seriously and investigate, not to demand the reporter prove themselves.'],
  ['No vague warnings.', 'If someone has caused harm, we tell them specifically what they did and what changes are required.'],
  ['Transparency over comfort.', 'We publish aggregate moderation data every quarter so the community can see how we work.'],
  ['No permanent private decisions.', 'Members can appeal decisions. Appeals are reviewed by a different moderator.'],
  ['The community owns this space.', 'Ultimately we answer to the members, not to abstract policies.'],
]

const LOG = [
  { n: '14', l: 'reports received' },
  { n: '12', l: 'resolved within 24h' },
  { n: '3', l: 'members removed' },
  { n: '2', l: 'appeals received' },
  { n: '1', l: 'decision reversed on appeal' },
]

export function ReportPage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <header className={s.hero}>
        <div className="wrap">
          <div className={s.eyebrow}>
            <span className={s.live} /> Safety &amp; Reporting
          </div>
          <h1>
            Safety is <em>structural.</em>
          </h1>
          <p>Not decorative. Not a page in the footer. Our approach to handling reports, what happens when you make one, and the principles that guide every decision we make.</p>
        </div>
      </header>

      <section className={s.section}>
        <div className="wrap">
          <h2>
            How <em>reporting works</em>
          </h2>
          <p className={s.lead}>You submit a report. We respond within 24 hours. Here's exactly what happens in between — no black box, no vague reassurances.</p>
          <div className={s.flow}>
            {FLOW.map((f) => (
              <div key={f.n} className={s.flowStep}>
                <div className={s.flowN}>{f.n}</div>
                <div className={s.flowTitle}>{f.title}</div>
                <div className={s.flowDesc}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div className={s.formBox}>
            <div>
              <h3>
                Make a <em>report.</em>
              </h3>
              <p>Use this form for safety concerns, harassment, abuse, or any situation that made you feel unsafe. All reports are treated with full seriousness. There is no minimum threshold for what warrants a report.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  showToast("Report received — we'll follow up within 24 hours.", 'success')
                }}
              >
                <div className={s.field}>
                  <label>What are you reporting?</label>
                  <select className={s.select} defaultValue="">
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option>Harassment or threats</option>
                    <option>Unwanted contact or messages</option>
                    <option>Misrepresentation or impersonation</option>
                    <option>Discrimination</option>
                    <option>Unsafe behaviour at a gathering</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className={s.field}>
                  <label>Member or content involved (optional)</label>
                  <input className={s.input} type="text" placeholder="Username or URL" />
                </div>
                <div className={s.field}>
                  <label>What happened?</label>
                  <textarea className={s.textarea} placeholder="Tell us what happened, with as much detail as you're comfortable sharing. There are no wrong answers." />
                </div>
                <div className={s.field}>
                  <label>Your contact email (optional — for follow-up)</label>
                  <input className={s.input} type="email" placeholder="you@email.com" />
                </div>
                <div style={{ marginTop: 16 }}>
                  <Button type="submit">Submit report</Button>
                </div>
                <div className={s.fineprint}>Anonymous reports are accepted. If you leave an email, we'll follow up with you directly.</div>
              </form>
            </div>
            <div>
              <div className={s.princLabel}>Our principles</div>
              {PRINCIPLES.map(([strong, rest]) => (
                <div key={strong} className={s.principle}>
                  <span className={s.princDot} />
                  <span>
                    <strong>{strong}</strong> {rest}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className="wrap">
          <h2>
            Moderation <em>transparency</em>
          </h2>
          <p className={s.lead}>We publish a quarterly moderation report so the community can see how decisions are being made. This is what accountability looks like.</p>
          <div className={s.modLog}>
            <h3>
              Q1 2026 <em>moderation report</em>
            </h3>
            <p>Published April 2026 · Covers January – March 2026 · All data is aggregate and anonymised.</p>
            <div className={s.logStats}>
              {LOG.map((stat) => (
                <div key={stat.l} className={s.logStat}>
                  <div className="n" style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 38, color: 'var(--cream)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {stat.n}
                  </div>
                  <div className="l" style={{ fontSize: 12, color: 'rgba(247,243,238,.55)', marginTop: 6, lineHeight: 1.4 }}>
                    {stat.l}
                  </div>
                </div>
              ))}
            </div>
            <div className={s.modActions}>
              <Button variant="ghost-dark" to="/governance">
                View full report →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
