import { useState } from 'react'
import { LANGS } from './createGathering.data'

/** All wizard form state + helpers, shared by the page and its step components. */
export function useGatheringForm() {
  const [type, setType] = useState('')
  const [typeIcon, setTypeIcon] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('19:00')
  const [endTime, setEndTime] = useState('22:00')
  const [hood, setHood] = useState('')
  const [venue, setVenue] = useState('')
  const [address, setAddress] = useState('')
  const [directions, setDirections] = useState('')
  const [cap, setCap] = useState('14')
  const [lang, setLang] = useState(LANGS[0])
  const [access, setAccess] = useState<Set<string>>(new Set())
  const [accessNotes, setAccessNotes] = useState('')
  const [free, setFree] = useState(false)
  const [stdPrice, setStdPrice] = useState('10')
  const [supPrice, setSupPrice] = useState('18')
  const [included, setIncluded] = useState('')
  const [bring, setBring] = useState('')
  const [checks, setChecks] = useState<boolean[]>([false, false, false])

  const selectType = (name: string, icon: string) => {
    setType(name)
    setTypeIcon(icon)
  }
  const toggleAccess = (name: string) =>
    setAccess((prev) => {
      const n = new Set(prev)
      if (n.has(name)) n.delete(name)
      else n.add(name)
      return n
    })
  const toggleCheck = (i: number) => setChecks((prev) => prev.map((v, j) => (j === i ? !v : v)))

  const allChecked = checks.every(Boolean)
  const checkedCount = checks.filter(Boolean).length

  return {
    type, typeIcon, title, setTitle, desc, setDesc,
    date, setDate, time, setTime, endTime, setEndTime,
    hood, setHood, venue, setVenue, address, setAddress, directions, setDirections,
    cap, setCap, lang, setLang, access, accessNotes, setAccessNotes,
    free, setFree, stdPrice, setStdPrice, supPrice, setSupPrice, included, setIncluded, bring, setBring,
    checks, allChecked, checkedCount,
    selectType, toggleAccess, toggleCheck,
  }
}

export type GatheringForm = ReturnType<typeof useGatheringForm>
