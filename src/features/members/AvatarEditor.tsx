import { useEffect, useRef } from 'react'
import { FiCamera, FiTrash2 } from 'react-icons/fi'
import { ImageSlot, type ImageSlotTint } from '../../shared/components/ui'
import styles from './ProfileEdit.module.css'

/**
 * The hero portrait in edit mode: shows the current photo (or initials) with a
 * "Change photo" action and, when a photo is set, a "Remove" action. Object URLs
 * created from picked files are revoked when replaced or on unmount.
 */
export function AvatarEditor({
  photo,
  initials,
  tint,
  name,
  onChange,
  onRemove,
}: {
  photo?: string
  initials: string
  tint: ImageSlotTint
  name: string
  onChange: (url: string) => void
  onRemove: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const createdUrl = useRef<string | null>(null)

  useEffect(
    () => () => {
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current)
    },
    [],
  )

  function pick(file: File) {
    if (createdUrl.current) URL.revokeObjectURL(createdUrl.current)
    const url = URL.createObjectURL(file)
    createdUrl.current = url
    onChange(url)
  }

  return (
    <div className={styles.avatarWrap}>
      <ImageSlot
        tint={tint}
        src={photo}
        initials={initials}
        height={430}
        radius={20}
        placeholder={name}
      />
      <div className={styles.avatarActions}>
        <button
          type="button"
          className={styles.avatarBtn}
          onClick={() => fileRef.current?.click()}
        >
          <FiCamera size={15} />
          {photo ? 'Change photo' : 'Add photo'}
        </button>
        {photo && (
          <button
            type="button"
            className={`${styles.avatarBtn} ${styles.avatarBtnGhost}`}
            aria-label="Remove photo"
            onClick={() => {
              if (createdUrl.current) {
                URL.revokeObjectURL(createdUrl.current)
                createdUrl.current = null
              }
              onRemove()
            }}
          >
            <FiTrash2 size={15} />
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) pick(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
