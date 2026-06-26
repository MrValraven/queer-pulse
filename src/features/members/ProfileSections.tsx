import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Avatar,
  Button,
  Eyebrow,
  ImageSlot,
  Reveal,
  Tag,
  TagRow,
} from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { memberProfiles, type MemberProfile } from './data/memberProfiles'
import { discoverCount, earnedBadges, levelInfo } from './badges.data'
import { availableCount } from './perks.data'
import { VISIBILITY_LABEL } from './profileSections.data'
import {
  ActivitySection,
  BoardSection,
  GroupsSection,
  NowSection,
  RelatedSection,
  SelectedWorkSection,
  ShapingsSection,
  SkillsSection,
} from './ProfileContentSections'
import styles from './ProfilePage.module.css'

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

export function Section({
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

export function ProfileHero({ profile }: { profile: MemberProfile }) {
  return (
    <header className={styles.phero}>
      <div className="wrap">
        <div className={styles.pheroGrid}>
          <Reveal className={styles.portraitWrap}>
            <ImageSlot
              tint={profile.tint === 'auth' ? 'plum' : profile.tint}
              src={profile.photo}
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
                <Button size="lg" variant="ghost" to={routes.invite}>
                  Request an intro
                </Button>
              ) : (
                <Button size="lg" to={`/connect/${profile.slug}`}>
                  Say hello
                </Button>
              )}
              <Button size="lg" variant="ghost" to={routes.invite}>
                Vouch for {profile.first}
              </Button>
            </div>
            <div className={styles.vouchRow}>
              <div className={styles.vouchFaces}>
                {profile.vouchers.map((slug, index) => {
                  const voucher = memberProfiles[slug]
                  if (!voucher) return null
                  const name = `${voucher.first} ${voucher.last}`
                  return (
                    <Link
                      key={slug}
                      to={`/members/${slug}`}
                      className={styles.vouchFace}
                      style={{
                        marginLeft: index === 0 ? 0 : -12,
                        zIndex: profile.vouchers.length - index,
                      }}
                    >
                      <span className={styles.vouchTip}>{name}</span>
                      <Avatar
                        initials={voucher.initials}
                        tint={voucher.tint}
                        size={52}
                        src={voucher.photo}
                        alt={name}
                      />
                    </Link>
                  )
                })}
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
  )
}

export function RecognitionSection() {
  return (
    <Section title="Recognition" subtitle="Your level, badges and member perks">
      <div className={styles.recogGrid}>
        <Link to={routes.badges} className={styles.recogCard}>
          <div className={styles.recogTop}>
            <span className={styles.recogChip}>
              Level {levelInfo.level} · {levelInfo.name}
            </span>
          </div>
          <div className={styles.recogTitle}>Badges &amp; level</div>
          <div className={styles.recogDesc}>
            {earnedBadges.length} earned · {discoverCount} to discover
          </div>
          <div className={styles.recogXpBar}>
            <div className={styles.recogXpFill} style={{ width: `${levelInfo.percent}%` }} />
          </div>
          <div className={styles.recogArrow}>See badges &amp; level →</div>
        </Link>

        <Link to={routes.perks} className={styles.recogCard}>
          <div className={styles.recogTop}>
            <span className={`${styles.recogChip} ${styles.jade}`}>
              {availableCount} available
            </span>
          </div>
          <div className={styles.recogTitle}>Member perks</div>
          <div className={styles.recogDesc}>
            Bonuses your level unlocks — early RSVP access, the Trusted Lounge and more.
          </div>
          <div className={styles.recogArrow}>Redeem your perks →</div>
        </Link>
      </div>
    </Section>
  )
}

export function ProfileContent({
  profile,
  isSelf,
}: {
  profile: MemberProfile
  isSelf?: boolean
}) {
  return (
    <div className="wrap">
      {isSelf && <RecognitionSection />}
      <NowSection profile={profile} />
      <SelectedWorkSection profile={profile} />
      <BoardSection profile={profile} />
      <SkillsSection profile={profile} />
      <GroupsSection profile={profile} />
      <ShapingsSection profile={profile} />
      <ActivitySection profile={profile} />
      <RelatedSection profile={profile} />
    </div>
  )
}
