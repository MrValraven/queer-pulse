import { useState } from 'react'
import { FiCheck, FiClock } from 'react-icons/fi'
import { AppShell } from '../../shared/components/layout'
import { Avatar, Button, FadeIn, ImageSlot, SkeletonAvatar, SkeletonLine } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSimulatedLoad } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { PhotoUploadModal, type RecapPhoto } from './PhotoUploadModal'
import { RECAP_PHOTOS } from './gatheringRecap.data'
import styles from './GatheringRecapPage.module.css'

const ATTENDEES = [
  { initials: 'SR', tint: 'jade', name: 'Sofia R.', pronouns: 'she/her' },
  { initials: 'AK', tint: 'coral', name: 'Anika K.', pronouns: 'she/they' },
  { initials: 'JP', tint: 'plum', name: 'Jordan P.', pronouns: 'they/them' },
  { initials: 'TM', tint: 'jade', name: 'Tomás M.', pronouns: 'he/him' },
  { initials: 'MF', tint: 'coral', name: 'Maria F.', pronouns: 'she/her' },
  { initials: 'KL', tint: 'plum', name: 'Kai L.', pronouns: 'they/them' },
  { initials: 'BK', tint: 'jade', name: 'Bilal K.', pronouns: 'he/him' },
  { initials: 'NC', tint: 'coral', name: 'Nadia C.', pronouns: 'she/her' },
] as const

export function GatheringRecapPage() {
  const { showToast } = useToast()
  const loading = useSimulatedLoad()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [submittedPhotos, setSubmittedPhotos] = useState<RecapPhoto[]>([])

  function addPhoto(photo: RecapPhoto) {
    setSubmittedPhotos((prev) => [...prev, photo])
    showToast('Your photo was added to the recap.', 'success')
  }

  return (
    <AppShell unreadCount={3}>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>Gathering recap</div>
          <div className={styles.title}>
            Pride Brunch — <em>June Edition</em>
          </div>
          <div className={styles.meta}>Saturday 21 June 2026 · Príncipe Real, Lisbon</div>
          <div className={styles.attendedChip}><FiCheck /> 38 attended</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.sectionEyebrow}>The write-up</div>
              <div className={styles.sectionHead}>
                The <em>gathering</em>
              </div>
              <p className={styles.writeup}>
                We took over the terrace at A Cevicheria on a warm Saturday morning, and for three
                hours it became ours — a little corner of Príncipe Real that felt genuinely,
                unmistakably queer. Thirty-eight people came. Some knew each other; most didn't, at
                least not yet. By noon, you wouldn't have known the difference.
              </p>
              <p className={styles.writeup}>
                There was a long table of food that kept getting replenished. There were
                conversations that started with "how do you know the host?" and turned into
                something else entirely — plans, collaborations, phone numbers exchanged. Two people
                who'd been connected on QueerPulse for months finally met in person.
              </p>
              <p className={styles.writeup}>
                These gatherings don't have agendas. They're just time — held, deliberately, for
                people like us to be in a room together. This one was a good one. We'll do it again
                in July.
              </p>

              <div className={styles.photos}>
                <div className={styles.sectionEyebrow}>From the day</div>
                <div className={styles.photosGrid} aria-busy={loading}>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonLine key={i} height={140} style={{ borderRadius: 12 }} />
                      ))
                    : RECAP_PHOTOS.map((photo, index) => (
                        <FadeIn key={index} delay={Math.min(index, 8) * 60}>
                          <ImageSlot
                            tint={photo.tint}
                            src={photo.image}
                            height={140}
                            radius={12}
                            placeholder="photo from the gathering"
                          />
                        </FadeIn>
                      ))}
                  {submittedPhotos.map((photo) => (
                    <figure key={photo.id} className={styles.newPhoto}>
                      <ImageSlot tint={photo.tint} height={140} radius={12} placeholder="your photo" />
                      <figcaption className={styles.newPhotoCaption}>{photo.caption}</figcaption>
                    </figure>
                  ))}
                </div>
                <div className={styles.photoCaption}>
                  Photos by community members ·{' '}
                  <button
                    onClick={() => setUploadOpen(true)}
                    style={{ color: 'var(--accent-ink)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Submit yours →
                  </button>
                </div>
              </div>

              <div className={styles.who}>
                <div className={styles.sectionEyebrow}>Who was there</div>
                <div className={styles.sectionHead} style={{ fontSize: 'clamp(24px,3vw,34px)', marginBottom: 20 }}>
                  38 members <em>attended</em>
                </div>
                <div className={styles.whoGrid} aria-busy={loading}>
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={styles.whoCard}>
                          <SkeletonAvatar size={44} />
                          <SkeletonLine height={12} width="70%" style={{ margin: '10px auto 6px' }} />
                          <SkeletonLine height={10} width="45%" style={{ margin: '0 auto' }} />
                        </div>
                      ))
                    : ATTENDEES.map((person, i) => (
                        <FadeIn key={person.initials} delay={Math.min(i, 8) * 60} className={styles.whoCard}>
                          <Avatar
                            initials={person.initials}
                            tint={person.tint}
                            size={44}
                            style={{ margin: '0 auto' }}
                          />
                          <div className={styles.whoName}>{person.name}</div>
                          <div className={styles.whoPronouns}>{person.pronouns}</div>
                        </FadeIn>
                      ))}
                </div>
                <div className={styles.moreLabel}>+ 30 more members attended</div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sbCard}>
                <div className={styles.sbLabel}>Event details</div>
                <div className={styles.sbRow}>
                  <span className={styles.sdrLabel}>Date</span>
                  <span className={styles.sdrVal}>21 June 2026</span>
                </div>
                <div className={styles.sbRow}>
                  <span className={styles.sdrLabel}>Venue</span>
                  <span className={styles.sdrVal}>A Cevicheria</span>
                </div>
                <div className={styles.sbRow}>
                  <span className={styles.sdrLabel}>Attended</span>
                  <span className={styles.sdrVal}>38 members</span>
                </div>
                <div className={styles.hostRow}>
                  <Avatar initials="SR" tint="jade" size={34} />
                  <div>
                    <div className={styles.hostName}>Sofia Rodrigues</div>
                    <div className={styles.hostRole}>Host</div>
                  </div>
                </div>
              </div>

              <div className={styles.nextCard}>
                <div className={styles.nextEyebrow}>Coming up next</div>
                <div className={styles.nextTitle}>Queer Book Club — July</div>
                <div className={styles.nextDate}>Sat 19 July · LX Factory</div>
                <Button to={routes.rsvp} style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px 16px' }}>
                  RSVP →
                </Button>
              </div>

              <div className={styles.attendedCard}>
                <div className={styles.acRow}>
                  <span style={{ color: 'var(--jade)' }}><FiCheck /></span>
                  <div className={styles.acText}>You attended this gathering</div>
                </div>
                <span className={styles.acSoon} aria-disabled="true">
                  <FiClock /> Add to your year in review
                  <span className={styles.acSoonBadge}>Soon</span>
                </span>
              </div>

              <div className={styles.sbCard}>
                <div className={styles.shareRow}>
                  <div className={styles.shareLabel}>Share this recap</div>
                  <Button variant="ghost" style={{ fontSize: 12.5, padding: '8px 14px' }} onClick={() => showToast('Link copied!', 'success')}>
                    Copy link
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {uploadOpen && (
        <PhotoUploadModal onClose={() => setUploadOpen(false)} onSubmit={addPhoto} />
      )}
    </AppShell>
  )
}
