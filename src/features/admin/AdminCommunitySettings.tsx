import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { useToast } from '../../shared/components/feedback/useToast'
import { AdminChip, AdminToggle } from './ui'
import { shortName, visLabel, type Community, type Moderator } from './adminCommunities.data'
import styles from './AdminCommunitiesPage.module.css'

export function SettingsPane({ community }: { community: Community }) {
  const { showToast } = useToast()
  const [mods, setMods] = useState<Moderator[]>(community.mods)
  const [secondVouch, setSecondVouch] = useState(community.join.includes('2'))
  const [autoFreeze, setAutoFreeze] = useState(true)

  function removeMod(m: Moderator) {
    setMods((prev) => prev.filter((x) => x.name !== m.name))
    showToast(`Removed ${m.name} as moderator`, 'success', undefined, {
      label: 'Undo',
      onClick: () => setMods((prev) => (prev.some((x) => x.name === m.name) ? prev : [...prev, m])),
    })
  }

  return (
    <div className={styles.pane}>
      <div className={styles.setRow}>
        <div className={styles.setTop}>
          <div className={styles.setLabel}>Who can join</div>
          <AdminChip tone="plum">{community.join}</AdminChip>
        </div>
      </div>

      <div className={styles.setRow}>
        <div className={styles.setLabel}>Moderators</div>
        <div className={styles.modChips}>
          {mods.map((m) => (
            <span key={m.name} className={styles.modChip}>
              {shortName(m.name)}
              <button
                type="button"
                className={styles.modChipX}
                aria-label={`Remove ${m.name}`}
                onClick={() => removeMod(m)}
              >
                <FiX />
              </button>
            </span>
          ))}
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => showToast('Search members to add as moderator', 'info')}
          >
            + Add
          </button>
        </div>
      </div>

      <ToggleRow
        title="Require a second vouch to join"
        sub="Slows growth, raises trust. Recommended for support spaces."
        checked={secondVouch}
        onChange={(v) => {
          setSecondVouch(v)
          showToast(v ? 'Second vouch now required to join' : 'Second vouch no longer required', 'info')
        }}
      />
      <ToggleRow
        title="Auto-freeze new accounts on a doxxing report"
        sub="Buys time for a human to review before harm spreads."
        checked={autoFreeze}
        onChange={(v) => {
          setAutoFreeze(v)
          showToast(v ? 'Auto-freeze on doxxing reports enabled' : 'Auto-freeze disabled', 'info')
        }}
      />

      <div className={styles.setRow}>
        <div className={styles.setTop}>
          <div className={styles.setLabel}>Code of care</div>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => showToast('The code of care would open here', 'info')}
          >
            View
          </button>
        </div>
        <div className={styles.setDetail}>{community.code}</div>
      </div>

      <div className={styles.setRow}>
        <div className={styles.setTop}>
          <div className={styles.setLabel}>Visibility</div>
          <AdminChip tone={community.vis === 'public' ? 'jade' : 'violet'}>
            {visLabel(community.vis)}
          </AdminChip>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  sub,
  checked,
  onChange,
}: {
  title: string
  sub: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleSub}>{sub}</div>
      </div>
      <AdminToggle checked={checked} onChange={onChange} label={title} />
    </div>
  )
}
