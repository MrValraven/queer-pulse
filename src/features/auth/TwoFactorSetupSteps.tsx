/**
 * Sub-components for TwoFactorSetupPage step panes.
 * Kept separate to stay under the 200-line limit.
 */
import { useRef } from 'react'
import { Button } from '../../shared/components/ui'
import styles from './TwoFactorSetupPage.module.css'

const SECRET = 'QPLS-K4N3-7AXM-9QRV-2WCT-XEP8'
const BACKUP_CODES = ['4HF7-K2N9', 'RTPM-X3WL', '9CBJ-V8QA', 'ZNXD-K1HP', 'L7YR-2FCM', 'U6KW-9JBQ', '83XN-VTPC', 'QM4L-RKW2', 'FB2J-NXC7', 'HRVT-8YLP']

type Method = 'app' | 'sms'

// ── Step 1 ─────────────────────────────────────────────────────────────────
export function Step1({
  method, setMethod, onNext,
}: { method: Method; setMethod: (m: Method) => void; onNext: () => void }) {
  return (
    <div className={styles.pane}>
      <h2>How do you want to <em>receive your codes?</em></h2>
      <p className={styles.paneSub}>An authenticator app is the most secure. SMS works if you don't have one — but is less safe to SIM-swap attacks.</p>
      <div className={styles.methodGrid}>
        <button className={[styles.method, method === 'app' ? styles.methodSelected : ''].filter(Boolean).join(' ')} onClick={() => setMethod('app')}>
          <div className={styles.methodIc}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><rect x={6} y={2} width={12} height={20} rx={2.5} /><path d="M11 18h2" /></svg>
          </div>
          <div className={styles.methodText}>
            <h3>Authenticator app<span className={styles.recommended}>Recommended</span></h3>
            <p>Use Google Authenticator, 1Password, Authy, or similar. Works offline.</p>
          </div>
        </button>
        <button
          type="button"
          className={[styles.method, styles.methodDisabled].join(' ')}
          disabled
          aria-disabled="true"
          title="SMS unavailable in this demo — use an authenticator app"
        >
          <div className={[styles.methodIc, styles.methodIcJade].join(' ')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.09.57.21 1.19.36 1.78" /></svg>
          </div>
          <div className={styles.methodText}>
            <h3>SMS code<span className={styles.unavailable}>Unavailable</span></h3>
            <p>SMS unavailable in this demo — use an authenticator app.</p>
          </div>
        </button>
      </div>
      <div className={styles.paneActions}>
        <Button onClick={onNext}>Continue →</Button>
      </div>
    </div>
  )
}

// ── Step 2 ─────────────────────────────────────────────────────────────────
export function Step2({ onNext, onPrev, copyLabel, onCopy }: { onNext: () => void; onPrev: () => void; copyLabel: string; onCopy: () => void }) {
  return (
    <div className={styles.pane}>
      <h2>Scan with your <em>authenticator app.</em></h2>
      <p className={styles.paneSub}>Open the app, tap "+", choose "Scan QR code", and point it at this image.</p>
      <div className={styles.qrGrid}>
        <div className={styles.qrBox}>
          <svg viewBox="0 0 21 21" shapeRendering="crispEdges" aria-label="QR code" style={{ width: '100%', height: '100%', display: 'block' }}>
            <rect width={21} height={21} fill="#fff" />
            <g fill="#2D1B3D">
              <rect x={0} y={0} width={7} height={1} /><rect x={0} y={6} width={7} height={1} />
              <rect x={0} y={0} width={1} height={7} /><rect x={6} y={0} width={1} height={7} />
              <rect x={2} y={2} width={3} height={3} />
              <rect x={14} y={0} width={7} height={1} /><rect x={14} y={6} width={7} height={1} />
              <rect x={14} y={0} width={1} height={7} /><rect x={20} y={0} width={1} height={7} />
              <rect x={16} y={2} width={3} height={3} />
              <rect x={0} y={14} width={7} height={1} /><rect x={0} y={20} width={7} height={1} />
              <rect x={0} y={14} width={1} height={7} /><rect x={6} y={14} width={1} height={7} />
              <rect x={2} y={16} width={3} height={3} />
              <rect x={9} y={1} width={1} height={1} /><rect x={8} y={2} width={1} height={1} />
              <rect x={10} y={2} width={1} height={1} /><rect x={12} y={2} width={1} height={1} />
              <rect x={9} y={3} width={1} height={1} /><rect x={11} y={3} width={2} height={1} />
              <rect x={8} y={4} width={1} height={1} /><rect x={12} y={4} width={1} height={1} />
            </g>
          </svg>
        </div>
        <div className={styles.qrInfo}>
          <ol>
            <li>Open your authenticator app.</li>
            <li>Tap <b>Add</b> or <b>+</b>, then <b>Scan QR code</b>.</li>
            <li>Point your camera at the code on the left.</li>
            <li>Your app will save a QueerPulse entry and start generating six-digit codes.</li>
          </ol>
          <div className={styles.secretBlock}>
            <span>Can't scan? Enter manually: <code>{SECRET}</code></span>
            <button className={styles.copyBtn} onClick={onCopy} style={copyLabel === 'Copied' ? { color: 'var(--jade)' } : undefined}>{copyLabel}</button>
          </div>
        </div>
      </div>
      <div className={styles.paneActions}>
        <Button variant="ghost" onClick={onPrev}>← Back</Button>
        <Button onClick={onNext}>I scanned it →</Button>
      </div>
    </div>
  )
}

// ── Step 3 ─────────────────────────────────────────────────────────────────
export function Step3({
  digits, codeError, codeMsg, codeMsgOk,
  onInput, onKeyDown, onVerify, onPrev,
}: {
  digits: string[]; codeError: boolean; codeMsg: string; codeMsgOk: boolean
  onInput: (i: number, v: string) => void
  onKeyDown: (i: number, e: React.KeyboardEvent) => void
  onVerify: () => void; onPrev: () => void
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  return (
    <div className={styles.pane}>
      <h2>Verify it's <em>working.</em></h2>
      <p className={styles.paneSub}>Enter the six-digit code your app is showing right now.</p>
      <div className={[styles.codeRow, codeError ? styles.codeRowError : ''].filter(Boolean).join(' ')}>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { inputRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={(e) => onInput(i, e.target.value)} onKeyDown={(e) => onKeyDown(i, e)} />
        ))}
      </div>
      <div className={[styles.codeMsg, codeMsgOk ? styles.codeMsgOk : ''].filter(Boolean).join(' ')}>{codeMsg}</div>
      <div className={styles.paneActions}>
        <Button variant="ghost" onClick={onPrev}>← Back</Button>
        <Button onClick={onVerify}>Verify code →</Button>
      </div>
    </div>
  )
}

// ── Step 4 ─────────────────────────────────────────────────────────────────
export function Step4({ onCopyCodes, onDownload, onFinish }: { onCopyCodes: () => void; onDownload: () => void; onFinish: () => void }) {
  return (
    <div className={styles.pane}>
      <h2>Save your <em>backup codes.</em></h2>
      <p className={styles.paneSub}>If you lose your phone, these are your way back in. Each one works once. Print them, screenshot them, drop them in your password manager — but don't lose them.</p>
      <div className={styles.bcodeGrid}>
        {BACKUP_CODES.map((c) => <code key={c}>{c}</code>)}
      </div>
      <div className={styles.bcodeWarn}><b>Heads up:</b> we'll never show these again. Store them somewhere safe before continuing.</div>
      <div className={styles.bcodeActions}>
        <Button variant="ghost" onClick={onCopyCodes}>Copy all</Button>
        <Button variant="ghost" onClick={() => window.print()}>Print</Button>
        <Button variant="ghost" onClick={onDownload}>Download .txt</Button>
      </div>
      <div className={styles.paneActions}>
        <Button onClick={onFinish}>I saved them — finish setup</Button>
      </div>
    </div>
  )
}

// ── Done ────────────────────────────────────────────────────────────────────
export function StepDone({ onSecurity, onSettings }: { onSecurity: () => void; onSettings: () => void }) {
  return (
    <div className={styles.pane}>
      <div className={styles.doneCard}>
        <div className={styles.doneIc}>
          <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2>Two-factor is <em>on.</em></h2>
        <p className={styles.paneSub} style={{ textAlign: 'center', maxWidth: '36ch', margin: '0 auto 24px' }}>
          From now on, you'll enter a code from your authenticator app each time you sign in from a new device.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={onSecurity}>Back to Security</Button>
          <Button variant="ghost" onClick={onSettings}>All settings</Button>
        </div>
      </div>
    </div>
  )
}
