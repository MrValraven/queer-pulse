import { useRef, useState } from 'react'
import { FiDownload, FiUpload } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { ToolPage } from './tools/ToolPage'
import { useLocalStorage } from './tools/useLocalStorage'
import { RateBoardForm } from './RateBoardForm'
import { RateBoardStats } from './RateBoardStats'
import { SEED, type Experience, type RateEntry, type RateType } from './rateBoard.data'
import styles from './RateBoardPage.module.css'

const STORAGE_KEY = 'qp.economy.rateBoard'

const EXPERIENCES: Experience[] = ['junior', 'mid', 'senior', 'lead']
const TYPES: RateType[] = ['freelance', 'employed']

/** Validate + coerce one parsed object into a RateEntry (null if unusable). */
function coerceEntry(raw: unknown): RateEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.role !== 'string' || o.role.trim() === '') return null
  if (typeof o.dayRate !== 'number' || !Number.isFinite(o.dayRate) || o.dayRate <= 0) return null
  const experience = EXPERIENCES.includes(o.experience as Experience)
    ? (o.experience as Experience)
    : 'mid'
  const type = TYPES.includes(o.type as RateType) ? (o.type as RateType) : 'freelance'
  const id = typeof o.id === 'string' && o.id ? o.id : 'rb_imp_' + Math.random().toString(36).slice(2, 9)
  return { id, role: o.role.trim(), experience, dayRate: Math.round(o.dayRate), type }
}

export function RateBoardPage() {
  const { showToast } = useToast()
  const [entries, setEntries] = useLocalStorage<RateEntry[]>(STORAGE_KEY, SEED)
  const [compareRate, setCompareRate] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleAdd(entry: RateEntry) {
    setEntries((prev) => [entry, ...prev])
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'queerpulse-rate-board.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('Exported', 'success')
  }

  function mergeImported(parsed: unknown) {
    if (!Array.isArray(parsed)) {
      showToast("That file isn't a rate board — expected a JSON array.", 'error')
      return
    }
    const valid = parsed.map(coerceEntry).filter((e): e is RateEntry => e !== null)
    if (valid.length === 0) {
      showToast('No valid entries found in that file.', 'error')
      return
    }
    setEntries((prev) => {
      const seen = new Set(prev.map((e) => e.id))
      const fresh = valid.filter((e) => !seen.has(e.id))
      return [...fresh, ...prev]
    })
    showToast(`Imported ${valid.length} ${valid.length === 1 ? 'entry' : 'entries'}`, 'success')
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        mergeImported(JSON.parse(String(reader.result)))
      } catch {
        showToast("Couldn't read that file — is it valid JSON?", 'error')
      }
    }
    reader.onerror = () => showToast("Couldn't read that file.", 'error')
    reader.readAsText(file)
  }

  const actions = (
    <>
      <Button variant="ghost" onClick={handleExport}>
        <FiDownload aria-hidden /> Export JSON
      </Button>
      <Button variant="ghost" onClick={() => fileRef.current?.click()}>
        <FiUpload aria-hidden /> Import JSON
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className={styles.fileInput}
        onChange={handleFile}
        aria-label="Import a rate-board JSON file"
      />
    </>
  )

  return (
    <ToolPage
      eyebrow="Community"
      title={
        <>
          What we actually <em>charge.</em>
        </>
      }
      sub="Anonymous day rates shared by the community, so nobody has to guess. Add yours, see where you stand. Saved on this device."
      form={
        <RateBoardForm
          onAdd={handleAdd}
          compareRate={compareRate}
          onCompareChange={setCompareRate}
        />
      }
      preview={<RateBoardStats entries={entries} compareRate={compareRate} />}
      actions={actions}
    />
  )
}
