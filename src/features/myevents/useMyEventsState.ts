import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../shared/components/feedback/useToast'
import type { ToastAction } from '../../shared/components/feedback/toastContext'
import type {
  MyEvent, Notif, Pill, CalView, SortBy, Density, MobileView, Prefs, FilterKey,
} from './myEvents.types'
import type { MyEventsValue, MoreMenuState } from './MyEventsContext'
import {
  INITIAL_EVENTS, INITIAL_NOTIFS, DEFAULT_PREFS, TODAY, MONFULL, DOWFULL,
} from './myEvents.data'
import { inPill, parseDate, timeStr, mondayOf } from './myEvents.helpers'
import { downloadICS } from './myEvents.ics'

const PILLS: Pill[] = ['upcoming', 'going', 'hosting', 'waitlisted', 'past', 'saved']

/** Central state + actions for the My Events dashboard. */
export function useMyEventsState(): MyEventsValue {
  const { showToast } = useToast()
  const toast = useCallback(
    (msg: string, type: 'success' | 'info' = 'info') => showToast(msg, type),
    [showToast],
  )
  const toastAction = useCallback(
    (msg: string, action: ToastAction) => showToast(msg, 'info', 6000, action),
    [showToast],
  )

  const [events, setEvents] = useState<MyEvent[]>(INITIAL_EVENTS)
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS)
  const byId = useCallback((id: string) => events.find((e) => e.id === id), [events])

  const [pill, setPillState] = useState<Pill>('upcoming')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [pastShown, setPastShown] = useState(5)
  const [loading, setLoading] = useState(true)
  const loadTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const removeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const focusTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const startLoad = useCallback((delay: number) => {
    setLoading(true)
    clearTimeout(loadTimer.current)
    loadTimer.current = setTimeout(() => setLoading(false), delay)
  }, [])
  // Initial load-in: skeleton (loading starts true) then reveal after a beat.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])
  // Clear the pending soft-remove timer on unmount so it can't fire late.
  useEffect(() => () => { clearTimeout(removeTimer.current); clearTimeout(focusTimer.current) }, [])

  // calendar
  const [viewY, setViewY] = useState(TODAY.getFullYear())
  const [viewM, setViewM] = useState(TODAY.getMonth())
  const [weekStart, setWeekStart] = useState(() => mondayOf(TODAY))
  const [calView, setCalViewState] = useState<CalView>('month')

  // toolbar
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, boolean>>({
    inperson: false, online: false, free: false, paid: false, month: false,
  })
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [density, setDensity] = useState<Density>('comfortable')
  const [mobileView, setMobileView] = useState<MobileView>('list')

  // select + bulk
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  // notifications + modals + menu
  const [notifOpen, setNotifOpen] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, title: '', meta: '' })
  const [details, setDetails] = useState<{ open: boolean; evId: string | null }>({ open: false, evId: null })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [scope, setScope] = useState<{ open: boolean; evId: string | null; title: string }>({ open: false, evId: null, title: '' })
  const [moreMenu, setMoreMenu] = useState<MoreMenuState>({ open: false, evId: null, x: 0, y: 0 })
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)

  // safety flows + deep-link focus
  const [report, setReport] = useState<{ open: boolean; evId: string | null }>({ open: false, evId: null })
  const [block, setBlock] = useState<{ open: boolean; evId: string | null; host: string }>({ open: false, evId: null, host: '' })
  const [focusId, setFocusId] = useState<string | null>(null)

  // derived
  const counts = useMemo(() => {
    const c = {} as Record<Pill, number>
    PILLS.forEach((p) => { c[p] = events.filter((e) => inPill(e, p)).length })
    return c
  }, [events])
  const unreadCount = useMemo(() => notifs.filter((n) => n.unread).length, [notifs])
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected])
  const hasSecondary = !!searchTerm || Object.values(activeFilters).some(Boolean)

  // offline awareness
  useEffect(() => {
    const upd = () => setOffline(!navigator.onLine)
    window.addEventListener('online', upd)
    window.addEventListener('offline', upd)
    upd()
    return () => {
      window.removeEventListener('online', upd)
      window.removeEventListener('offline', upd)
    }
  }, [])

  // ── primary view ──────────────────────────────────
  const setPill = useCallback((p: Pill) => {
    setPillState(p)
    setSelectedDate(null)
    setPastShown(5)
    startLoad(320)
  }, [startLoad])

  const selectDay = useCallback((ds: string) => {
    setSelectedDate((cur) => (cur === ds ? null : ds))
    if (typeof window !== 'undefined' && window.innerWidth <= 700) setMobileView('list')
  }, [])
  const clearDay = useCallback(() => setSelectedDate(null), [])
  const loadMorePast = useCallback(() => setPastShown((n) => n + 5), [])

  // ── calendar ──────────────────────────────────────
  const shiftMonth = useCallback((dir: number) => {
    if (calView === 'week') {
      setWeekStart((ws) => {
        const next = new Date(ws); next.setDate(next.getDate() + dir * 7)
        setViewY(next.getFullYear()); setViewM(next.getMonth())
        return next
      })
    } else if (calView === 'year') {
      setViewY((y) => y + dir)
    } else {
      setViewM((m) => {
        let nm = m + dir
        if (nm < 0) { nm = 11; setViewY((y) => y - 1) }
        if (nm > 11) { nm = 0; setViewY((y) => y + 1) }
        return nm
      })
    }
  }, [calView])
  const goToday = useCallback(() => {
    setViewY(TODAY.getFullYear()); setViewM(TODAY.getMonth()); setWeekStart(mondayOf(TODAY))
  }, [])
  const setCalView = useCallback((v: CalView) => setCalViewState(v), [])
  const jumpMonth = useCallback((m: number) => { setViewM(m); setCalViewState('month') }, [])

  // ── toolbar ───────────────────────────────────────
  const setSearch = useCallback((v: string) => setSearchTerm(v), [])
  const toggleFilter = useCallback((k: FilterKey) => setActiveFilters((f) => ({ ...f, [k]: !f[k] })), [])
  const clearSecondary = useCallback(() => {
    setSearchTerm('')
    setActiveFilters({ inperson: false, online: false, free: false, paid: false, month: false })
  }, [])
  const setSort = useCallback((v: SortBy) => setSortBy(v), [])
  const toggleDensity = useCallback(() => setDensity((d) => (d === 'comfortable' ? 'compact' : 'comfortable')), [])

  // ── select + bulk ─────────────────────────────────
  const toggleSelectMode = useCallback(() => {
    setSelectMode((m) => !m)
    setSelected({})
  }, [])
  const toggleSelect = useCallback((id: string) => {
    setSelected((s) => { const next = { ...s }; if (next[id]) delete next[id]; else next[id] = true; return next })
  }, [])
  const closeBulk = useCallback(() => { setSelectMode(false); setSelected({}) }, [])
  const bulkAddCal = useCallback(() => {
    const n = selectedCount; toast(`${n} event${n > 1 ? 's' : ''} added to your calendar`, 'success')
  }, [selectedCount, toast])
  const bulkExport = useCallback(() => {
    const chosen = events.filter((e) => selected[e.id])
    const n = chosen.length
    downloadICS('queerpulse-events.ics', chosen)
    toast(`${n} event${n > 1 ? 's' : ''} exported as .ics`, 'success')
  }, [events, selected, toast])

  // ── soft remove with undo ─────────────────────────
  const softRemove = useCallback((id: string, msg: string) => {
    const ev = events.find((e) => e.id === id)
    if (!ev) return
    const idx = events.indexOf(ev)
    setRemovingId(id)
    clearTimeout(removeTimer.current)
    removeTimer.current = setTimeout(() => {
      setRemovingId(null)
      setEvents((prev) => prev.filter((e) => e.id !== id))
      toastAction(msg, {
        label: 'Undo',
        onClick: () => {
          setEvents((prev) => {
            const copy = prev.slice(); copy.splice(Math.min(idx, copy.length), 0, ev); return copy
          })
          toast('Brought it back', 'info')
        },
      })
    }, 200)
  }, [events, toast, toastAction])

  const bulkCancel = useCallback(() => {
    const ids = Object.keys(selected).filter((id) => {
      const e = events.find((x) => x.id === id)
      return e && (e.cat === 'going' || e.cat === 'waitlisted')
    })
    if (!ids.length) { toast('Select events you’re going to or waitlisted for first', 'info'); return }
    const removed = ids.map((id) => events.find((x) => x.id === id)).filter(Boolean) as MyEvent[]
    setEvents((prev) => prev.filter((e) => !ids.includes(e.id)))
    setSelected({})
    toastAction(`Dropped ${removed.length} event${removed.length > 1 ? 's' : ''}`, {
      label: 'Undo',
      onClick: () => setEvents((prev) => [...prev, ...removed]),
    })
  }, [events, selected, toast, toastAction])

  // ── rsvp lifecycle ────────────────────────────────
  const patch = useCallback((id: string, fn: (e: MyEvent) => MyEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? fn(e) : e)))
  }, [])

  const toggleReminder = useCallback((id: string) => {
    const ev = byId(id); if (!ev) return
    const next = !ev.reminder
    patch(id, (e) => ({ ...e, reminder: next }))
    toast(next ? `Reminder set — ${prefs.reminderLead} before` : 'Reminder off', 'info')
  }, [byId, patch, prefs.reminderLead, toast])

  const setMaybe = useCallback((id: string) => {
    patch(id, (e) => ({ ...e, maybe: true })); setMoreMenu((m) => ({ ...m, open: false }))
    toast('Marked as maybe — the host can see you’re tentative', 'info')
  }, [patch, toast])
  const setGoing = useCallback((id: string) => {
    patch(id, (e) => ({ ...e, maybe: false })); setMoreMenu((m) => ({ ...m, open: false }))
    toast('You’re fully in — see you there', 'success')
  }, [patch, toast])

  const rsvpSaved = useCallback((id: string) => {
    patch(id, (e) => ({ ...e, cat: 'going', whoText: `${e.going} going`, who: [['YOU', 'coral']] }))
    toast('You’re going — see you there', 'success')
  }, [patch, toast])

  const acceptInvite = useCallback((id: string) => {
    const ev = byId(id); if (!ev) return
    const dt = parseDate(ev.date)
    setConfirm({
      open: true,
      title: ev.title,
      meta: `${DOWFULL[dt.getDay()]} ${dt.getDate()} ${MONFULL[dt.getMonth()]} · ${timeStr(ev)} · ${ev.venue}`,
    })
    patch(id, (e) => ({ ...e, cat: 'going', whoText: `${e.going} going`, who: [['YOU', 'coral']] }))
  }, [byId, patch])
  const closeConfirm = useCallback(() => setConfirm((c) => ({ ...c, open: false })), [])
  const declineInvite = useCallback((id: string) => softRemove(id, 'Invitation declined — that’s okay.'), [softRemove])

  const cantGo = useCallback((id: string) => {
    const ev = byId(id)
    if (ev?.series) { setScope({ open: true, evId: id, title: ev.title }); return }
    softRemove(id, 'Your place was released — the next person on the waitlist will hear from us.')
  }, [byId, softRemove])
  const leaveWaitlist = useCallback((id: string) => softRemove(id, 'You’ve left the waitlist.'), [softRemove])
  const closeScope = useCallback(() => setScope((s) => ({ ...s, open: false })), [])
  const scopeChoice = useCallback((which: 'one' | 'all') => {
    const id = scope.evId
    setScope((s) => ({ ...s, open: false }))
    if (!id) return
    if (which === 'one') softRemove(id, 'Skipped this one — you’re still in the series.')
    else softRemove(id, 'Left the whole series.')
  }, [scope.evId, softRemove])

  // ── notifications ─────────────────────────────────
  const markAllRead = useCallback(() => setNotifs((ns) => ns.map((n) => ({ ...n, unread: false }))), [])
  const goToEvent = useCallback((evId: string) => {
    const ev = byId(evId); if (!ev) return
    const dt = parseDate(ev.date)
    setViewY(dt.getFullYear()); setViewM(dt.getMonth()); setCalViewState('month')
    setPillState(ev.cat === 'past' ? 'past'
      : ev.cat === 'saved' || ev.cat === 'invite' || ev.cat === 'sent' ? 'saved'
        : ev.cat === 'waitlisted' ? 'waitlisted' : 'upcoming')
    clearSecondary()
    setSelectedDate(ev.date)
    if (typeof window !== 'undefined' && window.innerWidth <= 700) setMobileView('list')
    // Flag the target card so it can scroll into view + flash, then clear.
    setFocusId(evId)
    clearTimeout(focusTimer.current)
    focusTimer.current = setTimeout(() => setFocusId(null), 1800)
  }, [byId, clearSecondary])
  const notifGo = useCallback((i: number) => {
    const n = notifs[i]; if (!n) return
    setNotifs((ns) => ns.map((x, j) => (j === i ? { ...x, unread: false } : x)))
    setNotifOpen(false)
    goToEvent(n.evId)
  }, [notifs, goToEvent])

  // ── details + settings ────────────────────────────
  const openDetails = useCallback((id: string) => setDetails({ open: true, evId: id }), [])
  const closeDetails = useCallback(() => setDetails((d) => ({ ...d, open: false })), [])
  const openSettings = useCallback(() => setSettingsOpen(true), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const setPref = useCallback(
    (key: keyof Prefs, value: Prefs[keyof Prefs]) => setPrefs((p) => ({ ...p, [key]: value })),
    [],
  )
  const saveSettings = useCallback((next: Partial<Prefs>) => {
    setPrefs((p) => ({ ...p, ...next })); setSettingsOpen(false); toast('Preferences saved', 'success')
  }, [toast])

  // ── more menu ─────────────────────────────────────
  const openMore = useCallback((evId: string, x: number, y: number) => setMoreMenu({ open: true, evId, x, y }), [])
  const closeMore = useCallback(() => setMoreMenu((m) => ({ ...m, open: false })), [])

  // ── safety flows ──────────────────────────────────
  const openReport = useCallback((evId: string) => {
    setMoreMenu((m) => ({ ...m, open: false })); setReport({ open: true, evId })
  }, [])
  const closeReport = useCallback(() => setReport((r) => ({ ...r, open: false })), [])
  const submitReport = useCallback(() => {
    setReport((r) => ({ ...r, open: false }))
    toast('Report sent — our safety team takes it from here', 'success')
  }, [toast])
  const openBlock = useCallback((evId: string) => {
    const ev = byId(evId)
    setMoreMenu((m) => ({ ...m, open: false }))
    setBlock({ open: true, evId, host: ev?.community ?? '' })
  }, [byId])
  const closeBlock = useCallback(() => setBlock((b) => ({ ...b, open: false })), [])
  const confirmBlock = useCallback(() => {
    setBlock((b) => ({ ...b, open: false }))
    toast('Blocked — you won’t see their events again', 'success')
  }, [toast])

  return {
    events, notifs, unreadCount, counts, byId,
    pill, selectedDate, loading, setPill, selectDay, clearDay, loadMorePast, pastShown,
    viewY, viewM, weekStart, calView, shiftMonth, goToday, setCalView, jumpMonth,
    searchTerm, activeFilters, sortBy, density, mobileView,
    setSearch, toggleFilter, clearSecondary, setSort, toggleDensity, setMobileView, hasSecondary,
    selectMode, selected, selectedCount, toggleSelectMode, toggleSelect, closeBulk, bulkAddCal, bulkExport, bulkCancel,
    toggleReminder, setMaybe, setGoing, rsvpSaved, acceptInvite, declineInvite, cantGo, leaveWaitlist, softRemove, removingId,
    markAllRead, notifGo, notifOpen, setNotifOpen,
    confirm, closeConfirm, details, openDetails, closeDetails, settingsOpen, openSettings, closeSettings,
    scope, closeScope, scopeChoice,
    prefs, setPref, saveSettings,
    moreMenu, openMore, closeMore,
    report, openReport, closeReport, submitReport,
    block, openBlock, closeBlock, confirmBlock,
    focusId,
    offline, toast,
  }
}
