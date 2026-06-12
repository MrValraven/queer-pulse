import { Link } from 'react-router-dom'
import { Avatar, Button } from '../../shared/components/ui'
import { memberName } from '../members/data/members'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './RsvpPage.module.css'

const DETAILS = [
  { icon: '📅', bg: 'rgba(232,119,90,.1)', label: 'Date & time', value: 'Sunday 22 June · 7:00 PM' },
  { icon: '📍', bg: 'rgba(74,140,111,.1)', label: 'Location', value: 'Mouraria Community Centre' },
  { icon: '👤', bg: 'rgba(45,27,61,.07)', label: 'Host', value: memberName('mariana') },
]

const COC = [
  { strong: 'This is an affirming space.', rest: ' Bring your whole self — including the parts you usually have to leave at the door. Queer identity, trans experience, neurodivergence, disability: you\'re welcome as you are.' },
  { strong: 'We practise active consent.', rest: ' Ask before touching, check before sharing photos, and take cues from each other. When in doubt, ask.' },
  { strong: 'What happens here stays here.', rest: ' This is a private community. Please don\'t share personal information, stories, or photos from gatherings without consent.' },
  { strong: 'If something doesn\'t feel right, tell the organiser.', rest: ' Mariana is there to make the space work for everyone. You don\'t need to manage it alone.' },
]

export function RsvpPage() {
  const { showToast } = useToast()

  return (
    <div className={styles.root}>
      <div className={styles.brand}>
        <Link to="/" className={styles.brandLink}>
          <span className={styles.pulseDot} aria-hidden />
          Queer<span className={styles.brandItalic}>Pulse</span>
        </Link>
      </div>

      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.checkWrap}>
              <svg viewBox="0 0 72 72" width={72} height={72}>
                <circle className={styles.checkCircle} cx={36} cy={36} r={32} />
                <polyline className={styles.checkMark} points="20,36 30,47 52,24" fill="none" />
              </svg>
            </div>
            <div className={styles.eyebrow}>You're going</div>
            <h1 className={styles.h}>
              You're <em>in.</em>
            </h1>
            <p className={styles.gName}>The Dispossessed — Reading Group #8</p>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.details}>
              {DETAILS.map((detail) => (
                <div key={detail.label} className={styles.detail}>
                  <span className={styles.detailIcon} style={{ background: detail.bg }}>
                    {detail.icon}
                  </span>
                  <div>
                    <div className={styles.detailLabel}>{detail.label}</div>
                    <div className={styles.detailVal}>{detail.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.withLabel}>You're going with</div>
            <div className={styles.withRow}>
              <div style={{ display: 'flex' }}>
                {[
                  { i: 'SA', t: 'jade' as const },
                  { i: 'TB', t: 'coral' as const },
                  { i: 'BP', t: 'plum' as const },
                  { i: 'JF', t: 'jade' as const },
                ].map((person, index) => (
                  <Avatar
                    key={index}
                    initials={person.i}
                    tint={person.t}
                    size={34}
                    style={{ marginLeft: index === 0 ? 0 : -8 }}
                  />
                ))}
              </div>
              <div className={styles.withText}>
                <strong>Sofia, Tomás, Beatriz, Jonas</strong>
                <br />
                and 8 other members
              </div>
            </div>

            <div className={styles.hostNote}>
              <div className={styles.hnHead}>
                <Avatar initials="ML" tint="plum" size={28} />
                <div>
                  <div className={styles.hnName}>{memberName('mariana')}</div>
                  <div className={styles.hnRole}>Reading group organiser</div>
                </div>
              </div>
              <p className={styles.hnText}>
                "So glad you're coming. We'll be reading chapters 10–14 this week. Bring your
                thoughts on Shevek's theory of time and simultaneity — it's a good one. The kitchen
                opens from 6:45 if you'd like to arrive early and settle in."
              </p>
            </div>

            <div className={styles.calLabel}>Add to calendar</div>
            <div className={styles.calRow}>
              <button className={styles.calBtn} onClick={() => showToast('Opening Google Calendar…', 'info')}>
                Google Calendar
              </button>
              <button className={styles.calBtn} onClick={() => showToast('Calendar file downloaded.', 'success')}>
                Apple / .ics
              </button>
            </div>

            <div className={styles.ctas}>
              <Button size="lg" to="/gathering">
                View gathering details
              </Button>
              <Button
                variant="ghost"
                onClick={() => showToast('Invite link copied. Share it with someone who should come.', 'success')}
              >
                Tell a friend — copy invite link
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.coc}>
        <div className={styles.cocInner}>
          <h2 className={styles.cocTitle}>
            What to <em>expect</em>
          </h2>
          <div className={styles.cocItems}>
            {COC.map((item) => (
              <div key={item.strong} className={styles.cocItem}>
                <div className={styles.cocDot} />
                <p className={styles.cocText}>
                  <strong>{item.strong}</strong>
                  {item.rest}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          You RSVPed as a QueerPulse member. <Link to="/gathering">Cancel RSVP</Link> ·{' '}
          <Link to="/privacy">Privacy policy</Link>
        </p>
      </div>
    </div>
  )
}
