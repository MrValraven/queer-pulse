import { useState, type ReactNode } from 'react'
import { Avatar, Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  COMMISSIONS,
  GALLERY,
  PICKS,
  THREADS,
  type Commission,
} from './culture.data'
import styles from './CulturePage.module.css'

function SectionHeader({
  title,
  sub,
  action,
}: {
  title: ReactNode
  sub: string
  action: ReactNode
}) {
  return (
    <div className={styles.secHeader}>
      <div>
        <h2 className={styles.secHead}>{title}</h2>
        <div className={styles.subLabel}>{sub}</div>
      </div>
      {action}
    </div>
  )
}

export function ClubSection() {
  const { showToast } = useToast()
  return (
    <section>
      <SectionHeader
        title={<>This month's <em>picks.</em></>}
        sub="Community-curated. Vote for next month's selection every last Sunday."
        action={<Button onClick={() => showToast('Suggest-a-pick form opened', 'info')}>+ Suggest a pick</Button>}
      />

      <div className={styles.picksGrid}>
        {PICKS.map((pick) => (
          <article key={pick.title} className={styles.pickCard}>
            <div className={`${styles.pickCover} ${styles[pick.kind]}`}>
              <span className={`${styles.pickBadge} ${styles[`badge_${pick.kind}`]}`}>
                {pick.kind}
              </span>
              {pick.emoji}
            </div>
            <div className={styles.pickBody}>
              <div className={styles.pickTitle}>{pick.title}</div>
              <div className={styles.pickAuthor}>{pick.author}</div>
              <div className={styles.pickMeta}>
                <span className={styles.pickDisc}>{pick.discussing}</span>
                <span>·</span>
                <span>{pick.when}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.threadHead}>
        <h3 className={styles.subHead}>Recent <em>discussions.</em></h3>
        <Button variant="ghost" onClick={() => showToast('New thread composer opened', 'info')}>
          + Start a thread
        </Button>
      </div>
      <div className={styles.threadList}>
        {THREADS.map((thread) => (
          <article key={thread.q} className={styles.threadItem}>
            <Avatar initials={thread.initials} tint={thread.tint} size={36} />
            <div className={styles.threadBody}>
              <div className={styles.threadQ}>{thread.q}</div>
              <div className={styles.threadMeta}>{thread.meta}</div>
            </div>
            <div className={styles.threadReplies}>{thread.replies} replies</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CommissionCard({ commission }: { commission: Commission }) {
  const [sent, setSent] = useState(false)
  return (
    <article className={styles.projCard}>
      <div className={`${styles.pcPill} ${styles[`pill_${commission.cat}`]}`}>
        {commission.catLabel}
      </div>
      <div className={styles.pcTitle}>{commission.title}</div>
      <p className={styles.pcDesc}>{commission.desc}</p>
      <div className={styles.pcSeeking}>{commission.seeking}</div>
      <div className={styles.pcTags}>
        {commission.tags.map((tag) => (
          <span key={tag} className={styles.pcTag}>{tag}</span>
        ))}
      </div>
      <div className={styles.pcFoot}>
        <div className={styles.pcWho}>
          <Avatar initials={commission.who.initials} tint={commission.who.tint} size={28} />
          {commission.who.name} · {commission.who.role}
        </div>
        <Button
          variant={sent ? 'jade' : 'ghost'}
          onClick={() => setSent(true)}
          disabled={sent}
        >
          {sent ? 'Interest sent ✓' : 'Express interest'}
        </Button>
      </div>
    </article>
  )
}

export function CommissionsSection() {
  const { showToast } = useToast()
  return (
    <section>
      <SectionHeader
        title={<>Creative <em>commissions.</em></>}
        sub="I'm making something — come help me make it better. More structured than the open board."
        action={<Button onClick={() => showToast('Post-a-project form opened', 'info')}>+ Post a project</Button>}
      />
      <div className={styles.projBoard}>
        {COMMISSIONS.map((commission) => (
          <CommissionCard key={commission.title} commission={commission} />
        ))}
      </div>
    </section>
  )
}

export function ShowcaseSection() {
  const { showToast } = useToast()
  return (
    <section>
      <SectionHeader
        title={<>Member <em>work.</em></>}
        sub="Rotating exhibition — 8 works shown at a time. Submissions reviewed monthly."
        action={<Button onClick={() => showToast('Submission form opened', 'info')}>+ Submit your work</Button>}
      />
      <div className={styles.galleryGrid}>
        {GALLERY.map((item) => (
          <div key={item.title} className={`${styles.galItem} ${item.feat ? styles.galFeat : ''}`}>
            <div className={styles.galBg} style={{ background: item.gradient }}>{item.emoji}</div>
            <div className={styles.galOverlay}>
              <div className={styles.goTitle}>{item.title}</div>
              <div className={styles.goArtist}>{item.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function RadioIntro() {
  const { showToast } = useToast()
  return (
    <section>
      <SectionHeader
        title={<>Community <em>radio.</em></>}
        sub="Ambient cultural presence — curated by rotating DJs. No algorithm. No ads."
        action={<Button onClick={() => showToast('Playlist submission opened', 'info')}>Submit a playlist</Button>}
      />
    </section>
  )
}
