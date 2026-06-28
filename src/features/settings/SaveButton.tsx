import { useEffect, useRef, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'

type SaveState = 'idle' | 'saving' | 'saved'

/**
 * Save button that simulates a save: disabled "Saving…" then a brief
 * "Saved ✓" before reverting to idle. Replaces toast-only save feedback.
 */
export function SaveButton({
  label = 'Save changes',
  savingLabel = 'Saving…',
  savedLabel = 'Saved',
  onSave,
}: {
  label?: string
  savingLabel?: string
  savedLabel?: string
  onSave?: () => void
}) {
  const [state, setState] = useState<SaveState>('idle')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function handleClick() {
    if (state !== 'idle') return
    setState('saving')
    onSave?.()
    timers.current.push(
      setTimeout(() => setState('saved'), 900),
      setTimeout(() => setState('idle'), 2600),
    )
  }

  return (
    <Button
      variant={state === 'saved' ? 'jade' : 'primary'}
      onClick={handleClick}
      disabled={state === 'saving'}
      aria-live="polite"
    >
      {state === 'saved' ? (
        <><FiCheck aria-hidden="true" /> {savedLabel}</>
      ) : state === 'saving' ? (
        savingLabel
      ) : (
        label
      )}
    </Button>
  )
}
