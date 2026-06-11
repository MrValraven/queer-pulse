import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import type { CommunityDetail, Person, Thread as ThreadData } from './communityDetails'
import { AV_CLASS, CommunityThread } from './CommunityThread'
import styles from './CommunityDetailPage.module.css'

const GATHERING = routes.gathering
const MEMBER = routes.profile

export function AboutTab({ detail }: { detail: CommunityDetail }) {
  return (
    <div>
      {detail.about.map((p, i) => (
        <p className={styles.aboutP} key={i}>
          {p}
        </p>
      ))}

      <div className={styles.secLbl}>Who this is for</div>
      {detail.whoFor.map((w) => (
        <div className={styles.bullet} key={w}>
          <div className={styles.bulletDot} />
          <span>{w}</span>
        </div>
      ))}

      <div className={styles.secLbl}>Upcoming gathering</div>
      <Link to={GATHERING} className={styles.gCard}>
        <div className={styles.gDate}>
          <div className={styles.gDd}>{detail.nextEvent.dd}</div>
          <div className={styles.gDm}>{detail.nextEvent.mm}</div>
        </div>
        <div>
          <div className={styles.gTitle}>{detail.nextEvent.title}</div>
          <div className={styles.gMeta}>
            {detail.nextEvent.meta} · {detail.nextEvent.spots}
          </div>
        </div>
      </Link>

      <div className={styles.tagRow}>
        {detail.tags.map((t) => (
          <span className={styles.tag} key={t}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export function MembersTab({ members, hasCount, memberNum }: { members: Person[]; hasCount: boolean; memberNum: number }) {
  return (
    <div>
      <div className={styles.memberGrid}>
        {members.map((m, i) => (
          <Link to={MEMBER} className={styles.mCard} key={i}>
            <div className={[styles.mAv, AV_CLASS[m.tint]].join(' ')}>{m.initials}</div>
            <div className={styles.mName}>{m.name}</div>
            <div className={styles.mRole}>{m.role}</div>
          </Link>
        ))}
      </div>
      <p className={styles.showing}>{hasCount ? `Showing 8 of ${memberNum} members` : 'Showing the core members'}</p>
    </div>
  )
}

export function ForumTab({ threads }: { threads: ThreadData[] }) {
  const { showToast } = useToast()
  const [newPost, setNewPost] = useState('')
  return (
    <div>
      {threads.map((t, i) => (
        <CommunityThread data={t} key={i} />
      ))}
      <div className={styles.newPost}>
        <div className={[styles.rAv, styles.tPlum].join(' ')} style={{ width: 30, height: 30 }}>
          Me
        </div>
        <textarea
          className={styles.npTa}
          rows={1}
          placeholder="Start a new discussion in this community…"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <Button
          variant="ghost"
          onClick={() => {
            if (!newPost.trim()) return
            showToast('Post added to the community forum.', 'success')
            setNewPost('')
          }}
          style={{ whiteSpace: 'nowrap', fontSize: 13 }}
        >
          Post
        </Button>
      </div>
    </div>
  )
}
