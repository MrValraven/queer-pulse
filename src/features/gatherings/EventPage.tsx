import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, ImageSlot } from '../../shared/components/ui'
import styles from './EventPage.module.css'

const TIERS = [
  { name: 'Free', desc: 'No barriers to attending', price: '€0' },
  { name: 'Standard', desc: 'Covers the cost of your dinner', price: '€8' },
  { name: 'Supporter', desc: "Subsidises someone else's place", price: '€15' },
]

const DETAILS = [
  { icon: '📅', label: 'Date & time', value: 'Saturday, 14 June 2026', sub: '7:00pm–10:30pm (doors open 6:45pm)' },
  { icon: '📍', label: 'Location', value: 'Casa do Alentejo', sub: 'Rua das Portas de Santo Antão 58, Intendente · 5 min from Intendente metro' },
  { icon: '🍽️', label: 'Food & drink', value: 'Shared dinner included', sub: 'Note dietary requirements when you RSVP. Vegetarian and vegan options always available.' },
  { icon: '🗣️', label: 'Language', value: 'PT / EN · bilingual throughout', sub: "No one will be left out of a conversation." },
]

export function EventPage() {
  const [selectedTier, setSelectedTier] = useState(1)
  const [reserved, setReserved] = useState(false)

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Link to="/calendar" className={styles.back}>
            ← Gatherings
          </Link>
          <div className={styles.type}>Community gathering · Food &amp; conversation</div>
          <h1 className={styles.title}>
            Newcomer
            <br />
            <em>Welcome Dinner</em>
          </h1>
          <div className={styles.hostRow}>
            <Avatar initials="MC" tint="coral" size={34} />
            <div className={styles.by}>
              Hosted by <strong>Mateus Costa</strong> ·{' '}
              <Link to="/profile" style={{ color: 'rgba(247,243,238,.58)', textDecoration: 'underline' }}>
                View profile
              </Link>
            </div>
          </div>
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillHighlight}`}>Sat 14 June · 7:00pm</span>
            <span className={styles.pill}>Casa do Alentejo, Intendente</span>
            <span className={styles.pill}>Sliding scale · €0–€15</span>
            <span className={styles.pill}>5 spots left</span>
          </div>
        </div>
        <ImageSlot
          tint="plum"
          height={320}
          radius={0}
          placeholder="Event image — warm dinner setting, long communal table, candlelight"
          className={styles.imgStrip}
        />
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.section}>
                <div className={styles.sectionTitle}>About this gathering</div>
                <div className={styles.text}>
                  <p>
                    Once a month, we set a long table for people who have recently arrived in
                    Lisbon — or who arrived a while ago and never quite found their people. This
                    dinner is informal, unhurried, and bilingual. You don't need to know anyone.
                  </p>
                  <p>
                    We eat well, we stay too long, we probably talk about housing at some point.
                    The idea is to make introductions that have a chance of becoming something
                    real. Some of the people at the last dinner have since become flatmates,
                    collaborators, or close friends.
                  </p>
                  <p>
                    <strong>Accessibility:</strong> Casa do Alentejo is accessible by wheelchair
                    via the side entrance on Rua de Palma. Step-free access to all areas.
                  </p>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Event details</div>
                <div className={styles.details}>
                  {DETAILS.map((detail) => (
                    <div key={detail.label} className={styles.detail}>
                      <div className={styles.detailIcon}>{detail.icon}</div>
                      <div>
                        <div className={styles.detailLabel}>{detail.label}</div>
                        <div className={styles.detailValue}>{detail.value}</div>
                        <div className={styles.detailSub}>{detail.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>Community guidelines for this event</div>
                <div className={styles.text}>
                  <p>
                    This is a private QueerPulse event. Everyone here has been invited because
                    someone vouched for them or because they are already a member. The Code of
                    Care applies. Be warm. Be present. Don't take photos of people without asking.
                  </p>
                  <p>
                    The sliding scale is not a suggestion — if you can pay the higher tier, please
                    do. It directly subsidises someone else's ticket.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.aside}>
              <div className={styles.ticketCard}>
                <div className={styles.ticketHead}>
                  <div className={styles.ticketHeadTitle}>Reserve your place</div>
                  <div className={styles.ticketHeadSub}>Pay what you can. All tiers include everything.</div>
                </div>
                <div className={styles.spotsText}>
                  <span>
                    <strong>5 spots</strong> remaining
                  </span>
                  <span>21 of 26 filled</span>
                </div>
                <div className={styles.spotsBar}>
                  <div className={styles.spotsFill} style={{ width: '81%' }} />
                </div>
                <div className={styles.tiers}>
                  {TIERS.map((tier, index) => (
                    <button
                      key={tier.name}
                      className={[styles.tier, selectedTier === index && styles.tierSelected]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setSelectedTier(index)}
                    >
                      <span className={styles.tierRadio} />
                      <span style={{ flex: 1 }}>
                        <span className={styles.tierName} style={{ display: 'block' }}>
                          {tier.name}
                        </span>
                        <span className={styles.tierDesc}>{tier.desc}</span>
                      </span>
                      <span className={styles.tierPrice}>{tier.price}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.form}>
                  <input className={styles.input} type="text" placeholder="Your name" />
                  <input className={styles.input} type="email" placeholder="Your email" />
                  <input className={styles.input} type="text" placeholder="Dietary requirements (optional)" />
                  <button
                    className={[styles.rsvpBtn, reserved && styles.rsvpBtnDone].filter(Boolean).join(' ')}
                    onClick={() => setReserved(true)}
                    disabled={reserved}
                  >
                    {reserved ? 'Reserved ✓' : 'Reserve my place →'}
                  </button>
                </div>
                <div className={styles.note}>
                  You'll receive a confirmation email. You can cancel up to 48 hours before the
                  event.
                </div>
              </div>

              <div className={styles.membersOnly}>
                <div className="mo-title" style={{ fontSize: 13, fontWeight: 700, color: 'var(--jade)', marginBottom: 6 }}>
                  QueerPulse members only
                </div>
                <p>
                  This event is private. If someone forwarded you this link, ask them to invite you
                  to the network first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  )
}
