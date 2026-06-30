import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  EMERGENCY_REPORTS,
  OTHER_REPORTS,
  APPEALS,
  type ModReport,
  type Appeal,
} from './adminModeration.data'

export type TabId = 'open' | 'appeals' | 'resolved'
export type FilterId = 'all' | 'emergencies' | 'mine'

/** Reports notionally assigned to the signed-in moderator (for "Assigned to me"). */
const MINE = new Set(['r-emerg-1', 'r-harass', 'r-offtopic'])
const INITIAL_OPEN = [...EMERGENCY_REPORTS, ...OTHER_REPORTS]

/** All Moderation-page state + the reversible actions that drive it. */
export function useModerationQueue() {
  const [searchParams] = useSearchParams()
  const deepLink = searchParams.get('tab')
  const [tab, setTab] = useState<TabId>(
    deepLink === 'appeals' ? 'appeals' : deepLink === 'resolved' ? 'resolved' : 'open',
  )
  const [filter, setFilter] = useState<FilterId>(
    deepLink === 'emergencies' ? 'emergencies' : 'all',
  )
  const [open, setOpen] = useState<ModReport[]>(INITIAL_OPEN)
  const [appeals, setAppeals] = useState<Appeal[]>(APPEALS)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<ModReport | null>(null)
  const [appeal, setAppeal] = useState<Appeal | null>(null)
  const { showToast } = useToast()

  const clearLeaving = (ids: string[]) =>
    setLeaving((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })

  const matchesFilter = (r: ModReport) => {
    if (filter === 'emergencies') return r.severity === 'emergency'
    if (filter === 'mine') return MINE.has(r.id)
    return true
  }

  const visible = open.filter(matchesFilter)
  const emergencies = visible.filter((r) => r.severity === 'emergency')
  const others = visible.filter((r) => r.severity !== 'emergency')
  const oldest = visible.length > 0 ? visible[visible.length - 1]!.age : ''

  const replayOpen = () => {
    setLeaving(new Set())
    setPicked(new Set())
    setOpen(INITIAL_OPEN)
  }

  /** Animate ids out of the open queue, then drop them. */
  const removeReports = (ids: string[]) => {
    setLeaving((prev) => new Set([...prev, ...ids]))
    setPicked(new Set())
    window.setTimeout(() => {
      setOpen((q) => q.filter((r) => !ids.includes(r.id)))
      clearLeaving(ids)
    }, 340)
  }

  const undoToast = (message: string, restore: () => void, restored: string) =>
    showToast(message, 'success', undefined, {
      label: 'Undo',
      onClick: () => {
        restore()
        showToast(restored, 'info')
      },
    })

  const resolveReport = (id: string, verb = 'Resolved') => {
    const snapshot = open
    removeReports([id])
    undoToast(`${verb} · member notified`, () => {
      setLeaving(new Set())
      setOpen(snapshot)
    }, 'Restored the report.')
  }

  const openReport = (r: ModReport) => {
    if (!r.detail) {
      resolveReport(r.id, 'Actioned')
      return
    }
    setSelected(r)
  }

  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const bulkAct = (verb: string) => {
    const ids = [...picked]
    if (ids.length === 0) return
    const snapshot = open
    removeReports(ids)
    undoToast(`${ids.length} reports ${verb}`, () => {
      setLeaving(new Set())
      setOpen(snapshot)
    }, 'Restored the reports.')
  }

  const recordAppeal = (id: string, decision: 'uphold' | 'overturn') => {
    const a = appeals.find((x) => x.id === id)
    const snapshot = appeals
    setLeaving((prev) => new Set([...prev, id]))
    window.setTimeout(() => {
      setAppeals((list) => list.filter((x) => x.id !== id))
      clearLeaving([id])
    }, 340)
    const verb = decision === 'uphold' ? 'Upheld' : 'Overturned'
    undoToast(`${verb} · ${a?.appealBy ?? 'member'} notified`, () => {
      setLeaving(new Set())
      setAppeals(snapshot)
    }, 'Restored the appeal.')
  }

  return {
    tab, setTab,
    filter, setFilter,
    open, appeals,
    leaving, picked,
    selected, setSelected,
    appeal, setAppeal,
    visible, emergencies, others, oldest,
    showToast,
    replayOpen, resolveReport, openReport, togglePick, bulkAct, recordAppeal,
    resetAppeals: () => setAppeals(APPEALS),
    clearPicked: () => setPicked(new Set()),
  }
}
