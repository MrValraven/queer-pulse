import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { PageShell } from '../../shared/components/layout'
import { routes } from '../../app/routeMap'
import styles from './RecoveryCodesPage.module.css'

type CodeEntry = { code: string; used: string | null }

const INITIAL_CODES: CodeEntry[] = [
  { code: '4HF7-K2N9', used: null },
  { code: 'RTPM-X3WL', used: null },
  { code: '9CBJ-V8QA', used: '22 Mar' },
  { code: 'ZNXD-K1HP', used: null },
  { code: 'L7YR-2FCM', used: null },
  { code: 'U6KW-9JBQ', used: null },
  { code: '83XN-VTPC', used: null },
  { code: 'QM4L-RKW2', used: '8 Feb' },
  { code: 'FB2J-NXC7', used: null },
  { code: 'HRVT-8YLP', used: null },
]

export function RecoveryCodesPage() {
  const { showToast } = useToast()
  const [revealed, setRevealed] = useState(false)
  const [codes, setCodes] = useState(INITIAL_CODES)

  const unusedCodes = codes.filter((c) => !c.used)

  function reveal() {
    setRevealed(true)
  }

  function copyCodes() {
    const txt = unusedCodes.map((c) => c.code).join('\n')
    navigator.clipboard?.writeText(txt)
    showToast('Codes copied', 'success')
  }

  function downloadCodes() {
    const txt = unusedCodes.map((c) => c.code).join('\n')
    const blob = new Blob(['QueerPulse 2FA recovery codes — keep safe.\n\n' + txt + '\n'], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'queerpulse-recovery-codes.txt'
    a.click()
  }

  function regen() {
    if (!window.confirm('Replace all 10 codes? Old codes will stop working immediately.')) return
    const newCodes: CodeEntry[] = [
      { code: 'NEW1-A2B3', used: null }, { code: 'NEW2-C4D5', used: null },
      { code: 'NEW3-E6F7', used: null }, { code: 'NEW4-G8H9', used: null },
      { code: 'NEW5-I0J1', used: null }, { code: 'NEW6-K2L3', used: null },
      { code: 'NEW7-M4N5', used: null }, { code: 'NEW8-O6P7', used: null },
      { code: 'NEW9-Q8R9', used: null }, { code: 'NEW0-S0T1', used: null },
    ]
    setCodes(newCodes)
    setRevealed(true)
    showToast('New codes generated — they are revealed above', 'success')
  }

  const usedCount = codes.filter((c) => c.used !== null).length
  const currentRemaining = codes.length - usedCount
  const usedPct = (usedCount / codes.length) * 100

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.security} className={styles.back}>← Security</Link>
        <div className={styles.eyebrow}>Security · 2FA recovery codes</div>
        <h1 className={styles.h1}>Your way back in, <em>if you lose your phone.</em></h1>
        <p className={styles.lead}>Ten codes. Each works once. Use them only when your authenticator app is gone — phone lost, replaced, factory-reset. Don't store them on the same device as your authenticator.</p>

        <div className={styles.status}>
          <div className={styles.statusIc}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round">
              <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
            </svg>
          </div>
          <p>
            <b>{currentRemaining} of {codes.length} codes remain.</b> Generated <b>14 May 2026</b>. We recommend regenerating after{' '}
            <em>any device change</em> or every 12 months — whichever comes first.
          </p>
        </div>

        <div className={styles.card}>
          <h2>Your recovery <em>codes</em></h2>
          <p className={styles.cardSub}>Each code works exactly once. Used codes are crossed out and rendered useless — but we can't show you new ones without regenerating the whole set.</p>

          <div className={styles.gridWrap}>
            <div className={[styles.grid, !revealed ? styles.gridBlurred : ''].filter(Boolean).join(' ')}>
              {codes.map((c) => (
                <code key={c.code} className={c.used ? styles.codeUsed : undefined}>
                  <span>{c.code}</span>
                  <span className={styles.codeLbl}>{c.used ? `Used ${c.used}` : 'Unused'}</span>
                </code>
              ))}
            </div>
            {!revealed && (
              <div className={styles.reveal}>
                <Button onClick={reveal}>Reveal codes →</Button>
                <p>Will require your password</p>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={copyCodes}>Copy all</Button>
            <Button variant="ghost" onClick={() => window.print()}>Print</Button>
            <Button variant="ghost" onClick={downloadCodes}>Download .txt</Button>
          </div>
        </div>

        <div className={styles.usage}>
          <div className={styles.usageText}>
            <b>{usedCount} of {codes.length} codes used.</b> When you run out, you won't be able to recover the account if your 2FA app disappears — regenerate before then.
          </div>
          <div className={[styles.usageBar, usedPct >= 60 ? styles.usageBarWarn : ''].filter(Boolean).join(' ')}>
            <span style={{ width: `${usedPct}%` }} />
          </div>
        </div>

        <div className={styles.regen}>
          <h3>Regenerate the whole set</h3>
          <p>Creates a fresh batch of 10 codes. <b>The current set is invalidated immediately.</b> Use this if you suspect anyone else has seen these — or if you've moved phones and want clean numbers.</p>
          <Button onClick={regen}>Regenerate codes</Button>
        </div>
      </div>
    </PageShell>
  )
}
