import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import {
  Avatar,
  Button,
  Eyebrow,
  ImageSlot,
  KindChip,
  Reveal,
  Tag,
  TagRow,
} from '../../shared/components/ui'
import { linkToPath } from '../../app/routeMap'
import {
  defaultProfileSlug,
  memberProfiles,
  type MemberProfile,
} from './data/memberProfiles'
import styles from './ProfilePage.module.css'

const SHAPING_META: Record<string, { label: string; icon: string }> = {
  film: { label: 'A film', icon: '▶' },
  book: { label: 'A book or text', icon: '◻' },
  song: { label: 'A song or album', icon: '♩' },
  moment: { label: 'A moment', icon: '◈' },
}

const VISIBILITY_LABEL = {
  open: 'Open to connect',
  network: 'Network only',
  private: 'Private',
} as const

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <Reveal as="section" className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        <span className={styles.sectionSub}>{subtitle}</span>
      </div>
      {children}
    </Reveal>
  )
}

export function ProfilePage() {
  const { slug } = useParams()
  const profile: MemberProfile =
    (slug && memberProfiles[slug]) || memberProfiles[defaultProfileSlug]

  return (
    <PageShell>
      <div className={`${styles.backBar} wrap`}>
        <Link to="/members" className={styles.backLink}>
          ← Back to the room
        </Link>
      </div>

      <header className={styles.phero}>
        <div className="wrap">
          <div className={styles.pheroGrid}>
            <Reveal className={styles.portraitWrap}>
              <ImageSlot
                tint={profile.tint === 'auth' ? 'plum' : profile.tint}
                initials={profile.initials}
                height={430}
                radius={20}
                placeholder={`${profile.first} ${profile.last}`}
              />
              {profile.verified && (
                <span className={styles.vbadgeLg}>
                  <CheckIcon />
                  Verified member
                </span>
              )}
            </Reveal>

            <Reveal delay={80}>
              <Eyebrow live className={styles.eyebrow}>
                {VISIBILITY_LABEL[profile.visibility]}
              </Eyebrow>
              <h1 className={styles.name}>
                {profile.first} <em>{profile.last}</em>
              </h1>
              <div className={styles.role}>{profile.role}</div>
              <div className={styles.where}>
                <span className={styles.loc}>
                  <span className={styles.pin} aria-hidden />
                  {profile.hood}, Lisbon
                </span>
                <span className={styles.muted}>Member since {profile.since}</span>
              </div>
              <p className={styles.bio}>{profile.bio}</p>
              <TagRow style={{ marginTop: 20 }}>
                {profile.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </TagRow>
              <div className={styles.cta}>
                {profile.visibility === 'private' ? (
                  <Button size="lg" variant="ghost" to={linkToPath('QueerPulse Invite.html')}>
                    Request an intro
                  </Button>
                ) : (
                  <Button size="lg" to={`/connect/${profile.slug}`}>
                    Say hello
                  </Button>
                )}
                <Button size="lg" variant="ghost" to={linkToPath('QueerPulse Invite.html')}>
                  Vouch for {profile.first}
                </Button>
              </div>
              <div className={styles.vouchRow}>
                <div className={styles.vouchFaces}>
                  {profile.vouchers.map((voucher, index) => (
                    <Avatar
                      key={index}
                      initials={voucher.initials}
                      tint={voucher.tint}
                      size={36}
                      style={{ marginLeft: index === 0 ? 0 : -10 }}
                    />
                  ))}
                </div>
                <div className={styles.vouchText}>
                  Vouched for by <b>{profile.voucherNames}</b>.
                  <br />
                  That's the only number that matters here.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <div className="wrap">
        <Section title="Now" subtitle={`What ${profile.first} is in the middle of`}>
          <div className={styles.nowCard}>
            <span className={styles.nowDot} aria-hidden />
            <div className={styles.nowBody}>
              <p>{profile.now}</p>
              {profile.openTo.length > 0 && (
                <div className={styles.nowOpen}>
                  <span className="lbl">Open to</span>
                  {profile.openTo.map((item) => (
                    <span key={item} className={styles.openChip}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>

        {profile.work.length > 0 && (
          <Section title="Selected work" subtitle="A few things, not a portfolio dump">
            <div className={styles.workGrid}>
              {profile.work.map((item, index) => (
                <article key={item.title} className={styles.workCard}>
                  <ImageSlot
                    tint={(['coral', 'jade', 'plum'] as const)[index % 3]}
                    height={200}
                    radius={14}
                    placeholder="Work"
                    style={{ marginBottom: 14 }}
                  />
                  <div className={styles.workCat}>{item.category}</div>
                  <h3>{item.title}</h3>
                  <div className={styles.workYear}>{item.year}</div>
                </article>
              ))}
            </div>
          </Section>
        )}

        {profile.board.length > 0 && (
          <Section
            title="On the board"
            subtitle={`What ${profile.first} is asking for and offering right now`}
          >
            <div className={styles.miniBoard}>
              {profile.board.map((item) => (
                <Link key={item.slug} to={linkToPath(`QueerPulse Offer.html#${item.slug}`)} className={styles.ask}>
                  <KindChip kind={item.kind}>
                    {item.kind === 'looking' ? 'Looking' : 'Offering'}
                  </KindChip>
                  <h3>{item.title}</h3>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {Object.keys(profile.shapings).length > 0 && (
          <Section title="What shaped me" subtitle="Not interests. Formative texts, films, moments.">
            <div className={styles.shapingsGrid}>
              {(['film', 'book', 'song', 'moment'] as const).map((key) => {
                const item = profile.shapings[key]
                if (!item) return null
                return (
                  <div key={key} className={styles.shapingCard}>
                    <div className={styles.shapingLabel}>
                      {SHAPING_META[key].icon}&ensp;{SHAPING_META[key].label}
                    </div>
                    <div className={styles.shapingTitle}>{item.title}</div>
                    <div className={styles.shapingNote}>{item.note}</div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {profile.related.length > 0 && (
          <Section title="Also in the room" subtitle="People nearby in craft or neighbourhood">
            <div className={styles.relGrid}>
              {profile.related.map((relSlug) => {
                const related = memberProfiles[relSlug]
                if (!related) return null
                return (
                  <Link key={relSlug} to={`/profile/${relSlug}`} className={styles.relCard}>
                    <Avatar initials={related.initials} tint={related.tint} size={46} />
                    <div>
                      <div className={styles.relName}>
                        {related.first} {related.last}
                      </div>
                      <div className={styles.relRole}>
                        {related.role.split('·')[0].trim()} · {related.hood}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Section>
        )}
      </div>
    </PageShell>
  )
}

function CheckIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4 4L19 7"
        stroke="#fff"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
