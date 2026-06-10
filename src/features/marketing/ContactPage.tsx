import { useState } from 'react'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import s from './ContactPage.module.css'

const ROUTES = [
  { icon: '✉️', bg: 'rgba(232,119,90,.12)', title: 'General hello', desc: "Anything that doesn't fit elsewhere — questions, feedback, introductions, ideas.", email: 'hello@queerpulse.pt' },
  { icon: '🌿', bg: 'rgba(74,140,111,.12)', title: 'Safety concern', desc: 'If something in the network has made you feel unsafe. Handled with full discretion, within 24 hours.', email: 'safe@queerpulse.pt' },
  { icon: '📰', bg: 'rgba(45,27,61,.08)', title: 'Press & media', desc: "Journalists, researchers, documentary makers. We ask that you share your draft before publication.", email: 'press@queerpulse.pt' },
  { icon: '🤝', bg: 'rgba(232,119,90,.1)', title: 'Partnerships', desc: "Organisations and communities who want to work with QueerPulse. Selective, but genuinely interested.", email: 'partners@queerpulse.pt' },
]

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', topic: '', msg: '' })
  const valid = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.topic && form.msg.trim()

  return (
    <PageShell>
      <div className="wrap">
        <div className={s.grid}>
          <div className={s.intro}>
            <div className={s.eyebrow}>
              <span className={s.live} /> We read everything
            </div>
            <h1>
              Get in <em>touch.</em>
            </h1>
            <p>We're a small team and we respond to messages ourselves. Not an automated system, not a support ticket queue. Pick the route that makes the most sense for what you need to say.</p>
            <div className={s.routes}>
              {ROUTES.map((r) => (
                <a key={r.email} className={s.route} href={`mailto:${r.email}`}>
                  <span className={s.routeIcon} style={{ background: r.bg }}>
                    {r.icon}
                  </span>
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.desc}</p>
                    <span className={s.rLink}>{r.email} →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className={s.form}>
            {sent ? (
              <div className={s.sent}>
                <div className={s.tyIcon}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4 4L19 7" stroke="#4A8C6F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2>
                  Message <em>received.</em>
                </h2>
                <p>We'll read it and write back, usually within a day or two. If it's a safety concern, we'll be in touch within 24 hours.</p>
                <Button variant="ghost" to="/">
                  Back to QueerPulse
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (valid) setSent(true)
                }}
              >
                <h2>
                  Write to <em>us.</em>
                </h2>
                <p className={s.sub}>If you prefer a form to an email, use this. We read it the same way.</p>
                <div className={s.field}>
                  <label>Your name</label>
                  <input className={s.input} type="text" placeholder="How you'd like to be addressed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className={s.field}>
                  <label>Email</label>
                  <input className={s.input} type="email" placeholder="So we can write back" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className={s.field}>
                  <label>What's this about?</label>
                  <select className={s.select} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                    <option value="">Pick a topic</option>
                    <option>General question or feedback</option>
                    <option>Safety concern</option>
                    <option>Press or research inquiry</option>
                    <option>Partnership proposal</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className={s.field}>
                  <label>Your message</label>
                  <textarea className={s.textarea} placeholder="Write naturally. There's no template and no word count." value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
                </div>
                <Button type="submit" size="lg" disabled={!valid} style={{ width: '100%', justifyContent: 'center' }}>
                  Send →
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
