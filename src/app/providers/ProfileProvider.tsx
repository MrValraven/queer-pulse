import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { VisibilityMode } from '../../shared/components/ui/VisibilityBadge'
import { currentUser, type Member } from '../../features/members/data/members'

/** The editable subset of the logged-in member's profile. */
export interface ProfileDraft {
  photo?: string
  first: string
  last: string
  role: string
  pronouns: string
  hood: string
  bio: string
  tags: string[]
  visibility: VisibilityMode
}

function toDraft(m: Member): ProfileDraft {
  return {
    photo: m.photo,
    first: m.first,
    last: m.last,
    role: m.role,
    pronouns: m.pronouns ?? '',
    hood: m.hood,
    bio: m.bio,
    tags: [...m.tags],
    visibility: m.visibility,
  }
}

interface ProfileContextValue {
  /** Committed, live profile of the logged-in member — what their own hero renders. */
  profile: Member
  isEditing: boolean
  draft: ProfileDraft
  /** True for a few seconds after a save, to drive the confirmation banner. */
  justSaved: boolean
  startEditing: () => void
  cancelEditing: () => void
  save: () => void
  updateDraft: (patch: Partial<ProfileDraft>) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Member>(currentUser)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(currentUser))
  const [justSaved, setJustSaved] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current)
    },
    [],
  )

  const startEditing = useCallback(() => {
    setDraft(toDraft(profile))
    setJustSaved(false)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    setIsEditing(true)
  }, [profile])

  const cancelEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const updateDraft = useCallback((patch: Partial<ProfileDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const save = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      photo: draft.photo,
      first: draft.first.trim() || prev.first,
      last: draft.last.trim() || prev.last,
      role: draft.role.trim(),
      pronouns: draft.pronouns.trim() || undefined,
      hood: draft.hood.trim() || prev.hood,
      bio: draft.bio.trim() || prev.bio,
      tags: draft.tags,
      visibility: draft.visibility,
    }))
    setIsEditing(false)
    setJustSaved(true)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setJustSaved(false), 5000)
  }, [draft])

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      isEditing,
      draft,
      justSaved,
      startEditing,
      cancelEditing,
      save,
      updateDraft,
    }),
    [profile, isEditing, draft, justSaved, startEditing, cancelEditing, save, updateDraft],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider')
  return ctx
}
