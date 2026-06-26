import { useEffect, useState, type KeyboardEvent } from 'react'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  BioSection,
  IdentitySection,
  PronounsSection,
  SkillsSection,
  VisibilitySection,
} from './EditProfileSections'

/** Section id of a change, so the host can list what was edited on save. */
export type ProfileSection = 'identity' | 'pronouns' | 'bio' | 'skills' | 'visibility'

/**
 * Full profile editor — the rich Identity / Pronouns / Bio / Skills / Visibility
 * sections. Owns its own field state and reports any change via `onChange` (with
 * the section that changed) so the host can drive its save bar and confirmation.
 */
export function EditProfilePane({ onChange }: { onChange: (section: ProfileSection) => void }) {
  const { showToast } = useToast()
  const [selectedPronouns, setSelectedPronouns] = useState<string[]>(['she/her'])
  const [skills, setSkills] = useState(['Community organising', 'Legal research'])
  const [interests, setInterests] = useState(['Housing policy', 'Queer theory', 'Lisbon history'])
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [bioText, setBioText] = useState(
    'Former housing rights lawyer. Has been doing community organising in Mouraria since 2018. Convinced the platform needed to exist before she knew how to build it.',
  )
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Revoke the current object URL when it's replaced or the pane unmounts.
  useEffect(() => {
    if (!avatarPreview) return
    return () => URL.revokeObjectURL(avatarPreview)
  }, [avatarPreview])

  function handlePickFile(file: File) {
    setAvatarPreview(URL.createObjectURL(file))
    showToast('Photo updated', 'success')
    onChange('identity')
  }

  function handleRemovePhoto() {
    setAvatarPreview(null)
    showToast('Photo removed.', 'info')
    onChange('identity')
  }

  function togglePronoun(p: string) {
    setSelectedPronouns((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
    onChange('pronouns')
  }

  function addTag(key: 'skills' | 'interests', val: string) {
    const trimmed = val.trim()
    if (!trimmed) return
    if (key === 'skills') {
      setSkills((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
      setSkillInput('')
    } else {
      setInterests((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
      setInterestInput('')
    }
    onChange('skills')
  }

  function removeTag(key: 'skills' | 'interests', val: string) {
    if (key === 'skills') setSkills((prev) => prev.filter((s) => s !== val))
    else setInterests((prev) => prev.filter((s) => s !== val))
    onChange('skills')
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>, key: 'skills' | 'interests') {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(key, key === 'skills' ? skillInput : interestInput)
    }
  }

  return (
    <>
      <IdentitySection
        avatarPreview={avatarPreview}
        onPickFile={handlePickFile}
        onRemove={handleRemovePhoto}
        onChange={() => onChange('identity')}
      />
      <PronounsSection selected={selectedPronouns} onToggle={togglePronoun} onChange={() => onChange('pronouns')} />
      <BioSection bioText={bioText} onChange={setBioText} onAnyChange={() => onChange('bio')} />
      <SkillsSection
        skills={skills}
        interests={interests}
        skillInput={skillInput}
        interestInput={interestInput}
        onSkillInputChange={setSkillInput}
        onInterestInputChange={setInterestInput}
        onAdd={addTag}
        onRemove={removeTag}
        onKeyDown={handleTagKey}
      />
      <VisibilitySection onChange={() => onChange('visibility')} />
    </>
  )
}
