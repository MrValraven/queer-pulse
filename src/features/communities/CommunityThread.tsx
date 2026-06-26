import { useState } from 'react'
import { FiMessageCircle } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import type { Thread as ThreadData } from './communityDetails'
import { AV_CLASS } from './communityAvatar'
import styles from './CommunityDetailPage.module.css'

export function CommunityThread({ data }: { data: ThreadData }) {
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [voted, setVoted] = useState(false)
  const [reply, setReply] = useState('')
  const [extra, setExtra] = useState<{ name: string; text: string }[]>([])

  const post = () => {
    if (!reply.trim()) return
    setExtra((e) => [...e, { name: 'You', text: reply.trim() }])
    setReply('')
    showToast('Reply posted.', 'success')
  }

  return (
    <div className={styles.thread}>
      <div
        className={styles.thHead}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
      >
        <div className={styles.thVote}>
          <button
            type="button"
            className={[styles.vbtn, voted && styles.vbtnVoted].filter(Boolean).join(' ')}
            onClick={(e) => {
              e.stopPropagation()
              setVoted((v) => !v)
            }}
          >
            ▲
          </button>
          <span className={styles.vnum}>{data.votes + (voted ? 1 : 0)}</span>
        </div>
        <div className={styles.thMain}>
          <div className={styles.thTitle}>{data.title}</div>
          <div className={styles.thMeta}>
            <div className={[styles.thAv, AV_CLASS[data.author.tint]].join(' ')}>{data.author.initials}</div>
            <span className={styles.thName}>{data.author.name}</span>
            <span>{data.time}</span>
            <span className={styles.thReplies}><FiMessageCircle /> {data.replyCount} replies</span>
          </div>
        </div>
      </div>
      {open && (
        <div className={styles.thBody}>
          <p className={styles.postText}>{data.post}</p>
          {data.replies.map((r, i) => (
            <div className={styles.reply} key={i}>
              <div className={[styles.rAv, AV_CLASS[r.tint]].join(' ')}>{r.initials}</div>
              <div>
                <div className={styles.rName}>{r.name}</div>
                <div className={styles.rText}>{r.text}</div>
              </div>
            </div>
          ))}
          {extra.map((r, i) => (
            <div className={styles.reply} key={`x${i}`}>
              <div className={[styles.rAv, styles.tPlum].join(' ')}>Me</div>
              <div>
                <div className={styles.rName}>{r.name}</div>
                <div className={styles.rText}>{r.text}</div>
              </div>
            </div>
          ))}
          <div className={styles.replyBar}>
            <div className={[styles.rAv, styles.tPlum].join(' ')}>Me</div>
            <textarea
              className={styles.replyTa}
              rows={1}
              placeholder="Reply to this thread…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <Button variant="primary" onClick={post} style={{ padding: '9px 16px', fontSize: 13 }}>
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
