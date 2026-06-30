import { useCallback, useState } from 'react'
import type { CalView } from './myEvents.types'
import { TODAY } from './myEvents.data'
import { mondayOf } from './myEvents.helpers'

export interface MyEventsCalendar {
  viewY: number
  viewM: number
  weekStart: Date
  calView: CalView
  shiftMonth: (dir: number) => void
  goToday: () => void
  setCalView: (v: CalView) => void
  jumpMonth: (m: number) => void
  /** Raw setters for deep-link focus (notification → jump the calendar). */
  setViewY: React.Dispatch<React.SetStateAction<number>>
  setViewM: React.Dispatch<React.SetStateAction<number>>
  setCalViewRaw: React.Dispatch<React.SetStateAction<CalView>>
}

/** Calendar view state (month/week/year) + navigation actions. */
export function useMyEventsCalendar(): MyEventsCalendar {
  const [viewY, setViewY] = useState(TODAY.getFullYear())
  const [viewM, setViewM] = useState(TODAY.getMonth())
  const [weekStart, setWeekStart] = useState(() => mondayOf(TODAY))
  const [calView, setCalViewState] = useState<CalView>('month')

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

  return {
    viewY, viewM, weekStart, calView, shiftMonth, goToday, setCalView, jumpMonth,
    setViewY, setViewM, setCalViewRaw: setCalViewState,
  }
}
