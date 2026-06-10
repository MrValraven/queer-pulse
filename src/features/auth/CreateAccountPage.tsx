import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { AuthLayout } from './AuthLayout'
import styles from './auth.module.css'

type Visibility = 'open' | 'network' | 'private'
const PRONOUNS = ['he/him', 'she/her', 'they/them', 'she/they', 'he/they']

const STRENGTH_LABELS = ['At least 10 characters', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['var(--ink-40)', 'var(--accent-ink)', '#E8B44A', 'var(--jade)', 'var(--jade)']

function passwordScore(value: string): number {
  let score = 0
  if (value.length >= 10) score++
  if (value.length >= 14) score++
  if (/[0-9]/.test(value) || /[^a-zA-Z0-9]/.test(value)) score++
  if (value.length >= 18) score++
  return Math.min(score, 4)
}

export function CreateAccountPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [bio, setBio] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('open')

  const score = useMemo(() => passwordScore(password), [password])

  return (
    <AuthLayout wide>
      <div className={styles.vouchRow}>
        <div className={styles.vouchAv}>TM</div>
        <div className={styles.vouchText}>
          <strong>Tomás Mendes</strong> invited you to QueerPulse
        </div>
      </div>

      <div className={styles.eyebrow}>Create your account</div>
      <h1>
        Welcome to the <em>community</em>
      </h1>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          navigate('/onboarding')
        }}
        style={{ marginTop: 28 }}
      >
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Your account</div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label>First name</label>
              <input type="text" placeholder="Sofia" />
            </div>
            <div className={styles.field}>
              <label>Last name</label>
              <input type="text" placeholder="Rodrigues" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Email address</label>
            <input type="email" value="sofia@gmail.com" disabled />
            <div className={styles.helper}>Taken from your invite — not editable</div>
          </div>
          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className={styles.strengthBar}>
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={styles.strengthSeg}
                  style={{ background: seg <= score ? STRENGTH_COLORS[score] : undefined }}
                />
              ))}
            </div>
            <div className={styles.strengthLabel} style={{ color: STRENGTH_COLORS[score] }}>
              {STRENGTH_LABELS[score]}
            </div>
          </div>
          <div className={styles.field}>
            <label>Confirm password</label>
            <input type="password" placeholder="Confirm your password" />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>About you</div>
          <div className={styles.field}>
            <label>Display name</label>
            <input type="text" placeholder="Sofia R." />
            <div className={styles.helper}>What members see. Can differ from your legal name.</div>
          </div>
          <div className={styles.field}>
            <label>Pronouns</label>
            <input
              type="text"
              placeholder="e.g. she/her"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
            />
            <div className={styles.pronounChips}>
              {PRONOUNS.map((p) => (
                <button key={p} type="button" className={styles.pChip} onClick={() => setPronouns(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label>Location</label>
            <input type="text" placeholder="Lisbon, Portugal" />
          </div>
          <div className={styles.field}>
            <label>Short bio</label>
            <textarea
              maxLength={280}
              placeholder="A sentence or two about you…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className={styles.charCount}>{bio.length}/280</div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionLabel}>Visibility</div>
          <div className={styles.visOpts}>
            {([
              { value: 'open', label: 'Visible to all members', sub: 'Your profile appears in the member directory' },
              { value: 'network', label: 'Visible to connections only', sub: "Only people you've connected with can see your full profile" },
              { value: 'private', label: 'Private', sub: 'Your profile is hidden; you can still browse and join gatherings' },
            ] as const).map((opt) => (
              <label
                key={opt.value}
                className={[styles.visOpt, visibility === opt.value && styles.visOptSelected].filter(Boolean).join(' ')}
              >
                <input
                  type="radio"
                  name="vis"
                  checked={visibility === opt.value}
                  onChange={() => setVisibility(opt.value)}
                />
                <div className={styles.visOptText}>
                  <span>{opt.label}</span>
                  <small>{opt.sub}</small>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className={styles.authBtn}>
          Create account
        </Button>
        <div className={styles.legalNote}>
          By creating an account you agree to our <Link to="/terms">Terms of Use</Link> and{' '}
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className={styles.signinLink}>
          Already have an account? <Link to="/sign-in">Sign in →</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
