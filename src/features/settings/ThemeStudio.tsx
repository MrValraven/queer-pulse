import { useState } from 'react'
import {
  FLAG_SWATCHES,
  COVER_STYLES,
  PATTERNS,
  BADGE_OPTIONS,
  type CoverStyle,
  type PatternKey,
} from './profileTheme.data'
import { currentUser, fullName } from '../members/data/members'
import styles from './ProfileThemePage.module.css'

function buildCoverBg(colors: string[], coverStyle: CoverStyle, pattern: PatternKey): string {
  let gradient: string
  if (coverStyle === 'gradient') {
    gradient = `linear-gradient(to right,${colors[0]},${colors[Math.floor(colors.length / 2)]})`
  } else if (coverStyle === 'stripe') {
    const pct = 100 / colors.length
    const stops = colors.map((c, i) => `${c} ${i * pct}% ${(i + 1) * pct}%`).join(',')
    gradient = `linear-gradient(to right,${stops})`
  } else {
    gradient = `linear-gradient(135deg,${colors[0]}22,${colors[Math.floor(colors.length / 2)]}22),var(--cream)`
  }
  const pats: Record<PatternKey, string> = {
    none: '',
    stripe: 'repeating-linear-gradient(45deg,rgba(255,255,255,.12) 0,rgba(255,255,255,.12) 2px,transparent 2px,transparent 10px),',
    dots: 'radial-gradient(circle,rgba(255,255,255,.18) 1px,transparent 1px) 0 0/6px 6px,',
    grid: 'repeating-linear-gradient(90deg,rgba(255,255,255,.1) 0,rgba(255,255,255,.1) 1px,transparent 1px,transparent 8px),repeating-linear-gradient(rgba(255,255,255,.1) 0,rgba(255,255,255,.1) 1px,transparent 1px,transparent 8px),',
  }
  return pats[pattern] + gradient
}

/**
 * The profile-theme picker + live preview. Shared by the standalone
 * `ProfileThemePage` and the Settings "Profile theme" pane. Pass `onChange`
 * to be notified when the host should surface unsaved changes.
 */
export function ThemeStudio({ onChange }: { onChange?: () => void }) {
  const [selectedFlag, setSelectedFlag] = useState(0)
  const [coverStyle, setCoverStyle] = useState<CoverStyle>('gradient')
  const [pattern, setPattern] = useState<PatternKey>('none')
  const [showBadges, setShowBadges] = useState(true)
  const [showLevel, setShowLevel] = useState(true)

  const coverBg = buildCoverBg(FLAG_SWATCHES[selectedFlag].colors, coverStyle, pattern)
  const touched = () => onChange?.()

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <div className={styles.pkHead}>Profile theme</div>
        <div className={styles.pkSub}>Shown on your public profile and in the member directory.</div>

        <div className={styles.pkLabel}>Pride themes</div>
        <div className={styles.flagGrid}>
          {FLAG_SWATCHES.map((f, i) => (
            <div
              key={f.label}
              className={`${styles.flagSwatch} ${i === selectedFlag ? styles.flagSwatchSelected : ''}`}
              style={{ background: f.background }}
              title={f.label}
              onClick={() => {
                setSelectedFlag(i)
                touched()
              }}
            />
          ))}
        </div>

        <div className={styles.pkLabel}>Cover style</div>
        <div className={styles.coverStyleOpts}>
          {COVER_STYLES.map((cs) => (
            <div
              key={cs.key}
              className={`${styles.csOpt} ${coverStyle === cs.key ? styles.csOptSelected : ''}`}
              onClick={() => {
                setCoverStyle(cs.key)
                touched()
              }}
            >
              <div className={styles.csRadio}><div className={styles.csDot} /></div>
              <div className={styles.csLabel}>{cs.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.pkLabel}>Cover pattern</div>
        <div className={styles.patternGrid}>
          {PATTERNS.map((p) => (
            <div
              key={p.key}
              className={`${styles.patSwatch} ${pattern === p.key ? styles.patSwatchSelected : ''}`}
              style={{ background: p.background }}
              title={p.title}
              onClick={() => {
                setPattern(p.key)
                touched()
              }}
            />
          ))}
        </div>

        <div className={styles.pkLabel}>Badge display</div>
        <div className={styles.tglRows}>
          <div className={styles.tglRow}>
            <div className={styles.tglTitle}>Show badges on profile</div>
            <label className={styles.tglSw}>
              <input
                type="checkbox"
                checked={showBadges}
                onChange={(e) => {
                  setShowBadges(e.target.checked)
                  touched()
                }}
              />
              <div className={styles.tglTrack} />
              <div className={styles.tglThumb} />
            </label>
          </div>
          <div className={styles.tglRow}>
            <div className={styles.tglTitle}>Show level on profile</div>
            <label className={styles.tglSw}>
              <input
                type="checkbox"
                checked={showLevel}
                onChange={(e) => {
                  setShowLevel(e.target.checked)
                  touched()
                }}
              />
              <div className={styles.tglTrack} />
              <div className={styles.tglThumb} />
            </label>
          </div>
        </div>
        <select className={styles.badgeSelect} onChange={touched}>
          {BADGE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <div className={styles.previewLabel} style={{ marginBottom: 6 }}>Preview</div>
        <div style={{ fontSize: 13, color: 'var(--ink-40)', marginBottom: 20 }}>Updates live as you pick a theme.</div>
        <div className={styles.previewCards}>
          <div>
            <div className={styles.previewLabel}>Profile card</div>
            <div className={styles.profileCard}>
              <div className={styles.pclCover} style={{ background: coverBg }} />
              <div className={styles.pclAvWrap}>
                <div className={styles.pclAv}>{currentUser.initials}</div>
                <div className={styles.pclBadgeIcon} style={{ opacity: showBadges ? 1 : 0 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 11.2l-3.7 2.8 1.4-4.3L2 6.5h4.5L8 2Z" stroke="var(--plum)" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                </div>
              </div>
              <div className={styles.pclBody}>
                <div className={styles.pclName}>{fullName(currentUser)}</div>
                <div className={styles.pclPronouns}>he/they</div>
                <div className={styles.pclLoc}>Lisbon · Member since {currentUser.since}</div>
                <div className={styles.pclBio}>{currentUser.bio}</div>
                <div className={styles.pclLevel} style={{ opacity: showLevel ? 1 : 0 }}>Lv.4 · Familiar</div>
              </div>
            </div>
          </div>
          <div>
            <div className={styles.previewLabel}>Directory card</div>
            <div className={styles.dirCard}>
              <div className={styles.dcCover} style={{ background: coverBg }} />
              <div className={styles.dcAvWrap}><div className={styles.dcAv}>{currentUser.initials}</div></div>
              <div className={styles.dcBody}>
                <div className={styles.dcName}>{fullName(currentUser)}</div>
                <div className={styles.dcMeta}>he/they · Lisbon</div>
                <div className={styles.dcBio}>{currentUser.bio}</div>
              </div>
            </div>
            <div className={styles.previewHint}>This is how your profile appears in search results and the member directory.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
