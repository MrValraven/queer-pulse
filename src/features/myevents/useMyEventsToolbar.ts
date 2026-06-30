import { useCallback, useState } from 'react'
import type {
  SortBy, Density, MobileView, FilterKey,
} from './myEvents.types'

export interface MyEventsToolbar {
  searchTerm: string
  activeFilters: Record<FilterKey, boolean>
  sortBy: SortBy
  density: Density
  mobileView: MobileView
  setSearch: (v: string) => void
  toggleFilter: (k: FilterKey) => void
  clearSecondary: () => void
  setSort: (v: SortBy) => void
  toggleDensity: () => void
  setMobileView: React.Dispatch<React.SetStateAction<MobileView>>
  hasSecondary: boolean
}

/** Search / filter / sort / density / mobile-view toolbar state. */
export function useMyEventsToolbar(): MyEventsToolbar {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, boolean>>({
    inperson: false, online: false, free: false, paid: false, month: false,
  })
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [density, setDensity] = useState<Density>('comfortable')
  const [mobileView, setMobileView] = useState<MobileView>('list')

  const setSearch = useCallback((v: string) => setSearchTerm(v), [])
  const toggleFilter = useCallback((k: FilterKey) => setActiveFilters((f) => ({ ...f, [k]: !f[k] })), [])
  const clearSecondary = useCallback(() => {
    setSearchTerm('')
    setActiveFilters({ inperson: false, online: false, free: false, paid: false, month: false })
  }, [])
  const setSort = useCallback((v: SortBy) => setSortBy(v), [])
  const toggleDensity = useCallback(() => setDensity((d) => (d === 'comfortable' ? 'compact' : 'comfortable')), [])

  const hasSecondary = !!searchTerm || Object.values(activeFilters).some(Boolean)

  return {
    searchTerm, activeFilters, sortBy, density, mobileView,
    setSearch, toggleFilter, clearSecondary, setSort, toggleDensity, setMobileView, hasSecondary,
  }
}
