import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { PageShell } from '../../shared/components/layout'
import { Button, FadeIn, Reveal, SkeletonLine } from '../../shared/components/ui'
import { useSimulatedLoad } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { calendarEvents, calendarLegend, type CalendarEvent } from './data'
import { MONTHS, MSHORT, CALENDAR_TODAY } from './calendar.data'
import styles from './CalendarPage.module.css'

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function EventCardSkeleton() {
  return (
    <div className={styles.eventCard} aria-hidden>
      <div className={styles.ecDate}>
        <SkeletonLine width={26} height={26} />
        <SkeletonLine width={28} height={11} style={{ marginTop: 4 }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="40%" height={11} />
        <SkeletonLine width="80%" height={14.5} style={{ marginTop: 6 }} />
        <SkeletonLine width="55%" height={12.5} style={{ marginTop: 6 }} />
      </div>
    </div>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  const navigate = useNavigate()
  return (
    <div
      className={styles.eventCard}
      onClick={() => navigate(event.to)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(event.to)
        }
      }}
    >
      <div className={styles.ecDate}>
        <div className={styles.ecD}>{event.date.getDate()}</div>
        <div className={styles.ecM} style={{ color: event.orgColor }}>{MSHORT[event.date.getMonth()]}</div>
      </div>
      <div>
        <div className={styles.ecOrg} style={{ color: event.orgColor }}>{event.org}</div>
        <div className={styles.ecTitle}>{event.title}</div>
        <div className={styles.ecMeta}>{event.hood} · {event.time}</div>
      </div>
    </div>
  )
}

export function CalendarPage() {
  const [view, setView] = useState({ year: 2026, month: 5 })
  const [selected, setSelected] = useState<Date | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const loading = useSimulatedLoad()

  const firstDayOffset = (new Date(view.year, view.month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  function eventsForDate(date: Date) {
    return calendarEvents.filter((e) => sameDay(e.date, date))
  }

  function changeMonth(delta: number) {
    setSelected(null)
    setView((current) => {
      let month = current.month + delta
      let year = current.year
      if (month < 0) { month = 11; year -= 1 }
      else if (month > 11) { month = 0; year += 1 }
      return { year, month }
    })
  }

  const upcoming = calendarEvents
    .filter((e) => e.date >= CALENDAR_TODAY)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  const selectedEvents = selected ? eventsForDate(selected) : []

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.eyebrow}>Community Calendar</Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>Everything happening <em>in one place.</em></Reveal>
          <Reveal as="p" className={styles.sub} delay={120}>
            QueerPulse gatherings, ILGA Portugal events, Rede ex aequo, Opus Diversus, community
            screenings, and more — all in one shared calendar.
          </Reveal>
          <Reveal className={styles.legend} delay={160}>
            {calendarLegend.map((item) => (
              <div key={item.label} className={styles.legItem}>
                <span className={styles.legDot} style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
          </Reveal>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.monthNav}>
                <button type="button" className={styles.navBtn} onClick={() => changeMonth(-1)} aria-label="Previous month"><FiChevronLeft /></button>
                <div className={styles.monthLabel}>{MONTHS[view.month]} {view.year}</div>
                <button type="button" className={styles.navBtn} onClick={() => changeMonth(1)} aria-label="Next month"><FiChevronRight /></button>
              </div>
              <div className={styles.grid}>
                <div className={styles.weekdays}>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                    <div key={d} className={styles.wd}>{d}</div>
                  ))}
                </div>
                <div className={styles.days}>
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className={`${styles.day} ${styles.empty}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const date = new Date(view.year, view.month, day)
                    const events = eventsForDate(date)
                    const isToday = sameDay(date, CALENDAR_TODAY)
                    const isSelected = selected !== null && sameDay(date, selected)
                    return (
                      <button
                        key={day}
                        className={[styles.day, isToday && styles.today, events.length > 0 && styles.hasEvent, isSelected && styles.selected].filter(Boolean).join(' ')}
                        onClick={() => events.length > 0 && setSelected(date)}
                      >
                        <div className={styles.dayNum}>{day}</div>
                        {events.length > 0 && (
                          <div className={styles.dayDots}>
                            {events.map((e, idx) => <span key={idx} className={styles.dayDot} style={{ background: e.orgColor }} title={e.title} />)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className={styles.allEvents}>
                <h3>All upcoming events</h3>
                <div className={styles.eventList}>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <EventCardSkeleton key={i} />)
                    : upcoming.map((event, index) => (
                        <FadeIn key={index} delay={Math.min(index, 8) * 60}>
                          <EventCard event={event} />
                        </FadeIn>
                      ))}
                </div>
              </div>
            </div>

            <div className={styles.side}>
              <div className={styles.csHead}>Selected day</div>
              <div className={styles.csSelectedDay}>
                {selected
                  ? selected.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Click any day with events to see details'}
              </div>
              <div className={styles.eventList}>
                {selected && (selectedEvents.length > 0
                  ? selectedEvents.map((event, index) => <EventCard key={index} event={event} />)
                  : <div className={styles.emptyDay}>No events on this day.</div>
                )}
              </div>
              <div className={styles.subStrip}>
                <h3>Subscribe to calendar</h3>
                <p>Get all queer community events delivered to your calendar app. Works with Google Calendar, Apple Calendar, and Outlook.</p>
                <form
                  className={styles.subForm}
                  onSubmit={(event) => {
                    event.preventDefault()
                    setSubscribed(true)
                  }}
                >
                  <input className={styles.subInput} type="email" placeholder="your@email.com" />
                  <Button type="submit" variant="primary" disabled={subscribed}>
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                </form>
              </div>
              <div style={{ marginTop: 16 }}>
                <Link to={routes.host} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--accent-ink)' }}>Host your own gathering →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
