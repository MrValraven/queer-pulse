import { useState, type KeyboardEvent } from 'react'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  BioSection,
  IdentitySection,
  PronounsSection,
  SkillsSection,
  VisibilitySection,
} from './EditProfileSections'

/**
 * Full profile editor — the rich Identity / Pronouns / Bio / Skills / Visibility
 * sections. Owns its own field state and reports any change via `onChange` so the
 * host (the settings page or the standalone edit-profile page) can drive its save bar.
 */
export function EditProfilePane({ onChange }: { onChange: () => void }) {
  const { showToast } = useToast()
  const [selectedPronouns, setSelectedPronouns] = useState<string[]>(['she/her'])
  const [skills, setSkills] = useState(['Community organising', 'Legal research'])
  const [interests, setInterests] = useState(['Housing policy', 'Queer theory', 'Lisbon history'])
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [bioText, setBioText] = useState(
    'Former housing rights lawyer. Has been doing community organising in Mouraria since 2018. Convinced the platform needed to exist before she knew how to build it.',
  )

  function togglePronoun(p: string) {
    setSelectedPronouns((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
    onChange()
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
    onChange()
  }

  function removeTag(key: 'skills' | 'interests', val: string) {
    if (key === 'skills') setSkills((prev) => prev.filter((s) => s !== val))
    else setInterests((prev) => prev.filter((s) => s !== val))
    onChange()
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
        onUpload={() => showToast('Photo upload — connect to your file system.', 'info')}
        onRemove={() => showToast('Photo removed.', 'info')}
        onChange={onChange}
      />
      <PronounsSection selected={selectedPronouns} onToggle={togglePronoun} onChange={onChange} />
      <BioSection bioText={bioText} onChange={setBioText} onAnyChange={onChange} />
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
      <VisibilitySection onChange={onChange} />
    </>
  )
}
