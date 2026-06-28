import { useMemo, useState } from 'react'
import { FiSend, FiCornerUpLeft, FiMessageCircle } from 'react-icons/fi'
import { Avatar, Button, FadeIn, SkeletonAvatar, SkeletonLine } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSimulatedLoad } from '../../shared/hooks'
import type { LivingCommunity, Post, PostReply, PulseMoment, Reaction, ReactionKey } from './community.model'
import { photoOf, roleLookup } from './communityPeople'
import { RoleBadge, ReactionBar } from './CommunityBadges'
import { AV_CLASS } from './communityAvatar'
import styles from './PulseTab.module.css'

function toggle(reactions: Reaction[], key: ReactionKey): Reaction[] {
  return reactions.map((r) =>
    r.key === key ? { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) } : r,
  )
}

function PulsePost({
  post,
  roleOf,
  pinned = false,
}: {
  post: Post
  roleOf: (p: Post['author']) => ReturnType<ReturnType<typeof roleLookup>>
  pinned?: boolean
}) {
  const [reactions, setReactions] = useState(post.reactions)
  const [showReply, setShowReply] = useState(false)
  const [replyDraft, setReplyDraft] = useState('')
  const [added, setAdded] = useState<PostReply[]>([])
  const replies = [...post.replies, ...added]
  const toggleReply = () => setShowReply((s) => !s)
  const sendReply = () => {
    const text = replyDraft.trim()
    if (!text) return
    setAdded((prev) => [...prev, { author: { initials: 'Me', name: 'You', tint: 'plum' }, text, time: 'just now' }])
    setReplyDraft('')
  }
  const replyLabel = replies.length
    ? `Show ${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`
    : 'Reply'
  return (
    <article className={[styles.post, pinned && styles.pinned].filter(Boolean).join(' ')}>
      {pinned && (
        <div className={styles.pinFlag}>
          <FiMessageCircle aria-hidden /> Pinned announcement
        </div>
      )}
      <header className={styles.pHead}>
        <Avatar initials={post.author.initials} tint={post.author.tint} src={photoOf(post.author)} size={40} alt={post.author.name} />
        <div className={styles.pWho}>
          <div className={styles.pName}>
            {post.author.name} <RoleBadge role={roleOf(post.author)} />
          </div>
          <div className={styles.pTime}>{post.time} ago</div>
        </div>
      </header>
      <p className={styles.pBody}>{post.body}</p>
      {post.image && (
        <div className={styles.pImg}>
          <img src={post.image} alt="" loading="lazy" />
        </div>
      )}
      <div className={styles.pFoot}>
        <ReactionBar reactions={reactions} onReact={(k) => setReactions((r) => toggle(r, k))} />
        <span
          role="button"
          tabIndex={0}
          aria-label={replyLabel}
          className={styles.replyBtn}
          onClick={toggleReply}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleReply()
            }
          }}
        >
          <FiCornerUpLeft aria-hidden /> {replies.length || 'Reply'}
        </span>
      </div>
      {replies.map((rep, i) => (
        <div className={styles.reply} key={`${rep.author.name}-${i}`}>
          <div className={[styles.rAv, AV_CLASS[rep.author.tint]].join(' ')}>{rep.author.initials}</div>
          <div>
            <span className={styles.rName}>{rep.author.name}</span> <span className={styles.rTime}>{rep.time}</span>
            <div className={styles.rText}>{rep.text}</div>
          </div>
        </div>
      ))}
      {showReply && (
        <div className={styles.replyBar}>
          <textarea
            className={styles.replyTa}
            rows={1}
            placeholder="Write a reply…"
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
          />
          <Button variant="ghost" style={{ fontSize: 13 }} onClick={sendReply}>
            Reply
          </Button>
        </div>
      )}
    </article>
  )
}

export function PulseTab({ community, name, isMember }: { community: LivingCommunity; name: string; isMember: boolean }) {
  const loading = useSimulatedLoad(500)
  const { showToast } = useToast()
  const roleOf = useMemo(() => roleLookup(community.roster), [community.roster])
  const [draft, setDraft] = useState('')
  const [mine, setMine] = useState<Post[]>([])

  const share = () => {
    const text = draft.trim()
    if (!text) return
    setMine((prev) => [
      { id: `me-${prev.length}`, author: { initials: 'Me', name: 'You', tint: 'plum' }, body: text, kind: 'post', reactions: [{ key: 'heart', count: 0 }], replies: [], time: 'just now', communitySlug: community.slug },
      ...prev,
    ])
    setDraft('')
    showToast('Shared with the community.', 'success')
  }

  // Interleave system moments between posts so the feed reads as alive.
  const feed: Array<{ post?: Post; moment?: PulseMoment }> = []
  const posts = [...mine, ...community.pulse]
  posts.forEach((post, i) => {
    feed.push({ post })
    if (community.moments[i]) feed.push({ moment: community.moments[i] })
  })

  if (loading) {
    return (
      <div aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className={styles.post} key={i}>
            <div className={styles.pHead}>
              <SkeletonAvatar size={40} />
              <SkeletonLine height={12} width="40%" />
            </div>
            <SkeletonLine height={12} style={{ margin: '14px 0 6px' }} />
            <SkeletonLine height={12} width="80%" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {isMember ? (
        <div className={styles.composer}>
          <Avatar initials="Me" tint="plum" size={38} />
          <textarea className={styles.composerTa} rows={1} placeholder={`Share something with ${name}…`} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <Button variant="primary" onClick={share} style={{ whiteSpace: 'nowrap' }}>
            <FiSend aria-hidden /> Share
          </Button>
        </div>
      ) : (
        <div className={styles.joinHint}>You're welcome to read — join {name} to take part.</div>
      )}

      {community.pinned.map((post) => (
        <FadeIn key={post.id}>
          <PulsePost post={post} roleOf={roleOf} pinned />
        </FadeIn>
      ))}

      {feed.map((item, i) =>
        item.post ? (
          <FadeIn key={item.post.id} delay={Math.min(i, 8) * 55}>
            <PulsePost post={item.post} roleOf={roleOf} />
          </FadeIn>
        ) : (
          <FadeIn key={`m-${item.moment!.id}`} delay={Math.min(i, 8) * 55}>
            <div className={styles.moment}>
              <span className={styles.momentDot} />
              {item.moment!.text} · <span className={styles.momentTime}>{item.moment!.time} ago</span>
            </div>
          </FadeIn>
        ),
      )}
    </div>
  )
}
