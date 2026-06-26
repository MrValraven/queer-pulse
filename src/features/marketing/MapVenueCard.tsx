import { FiMapPin, FiCheck } from 'react-icons/fi'
import { FaWheelchair } from 'react-icons/fa6'
import { TYPE_BG, TYPE_FG, TYPE_ICON, VIBE_BG, VIBE_FG, type Venue } from './map.data'
import s from './MapPage.module.css'

export function MapVenueCard({
  v,
  isExpanded,
  beenCount,
  marked,
  onToggle,
  onMarkBeen,
}: {
  v: Venue
  isExpanded: boolean
  beenCount: number
  marked: boolean
  onToggle: () => void
  onMarkBeen: () => void
}) {
  const TypeIcon = TYPE_ICON[v.type]
  return (
    <div
      className={[s.vc, isExpanded && s.vcExpanded].filter(Boolean).join(' ')}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className={s.vcHead}>
        <span className={s.vcIcon} style={{ background: TYPE_BG[v.type], color: TYPE_FG[v.type] }}>
          {TypeIcon && <TypeIcon />}
        </span>
        <div className={s.vcInfo}>
          <div className={s.vcName}>{v.name}</div>
          <div className={s.vcBairro}>{v.bairro}</div>
        </div>
        <div className={s.vcRight}>
          <span className={s.vcTypeTag} style={{ background: TYPE_BG[v.type], color: TYPE_FG[v.type] }}>
            {v.type}
          </span>
          {v.accessible && <span className={s.vcAccess}><FaWheelchair /></span>}
        </div>
      </div>
      <div className={s.vcVibes}>
        {v.vibe.map((t) => (
          <span key={t} className={s.vt} style={{ background: VIBE_BG[t], color: VIBE_FG[t] }}>
            {t}
          </span>
        ))}
      </div>
      {isExpanded && (
        <div className={s.vcBody}>
          <div className={s.vcRow}>
            <span className={s.vcRowIcon}><FiMapPin /></span>
            <span>{v.address}</span>
          </div>
          <div className={s.vcRow}>
            <span className={s.vcRowIcon}>◷</span>
            <span>{v.hours}</span>
          </div>
          <div className={s.vcNote}>{v.note}</div>
          <div className={s.vcBeenRow}>
            <div className={s.beenCount}>
              <b>{beenCount}</b> people been here
            </div>
            <button
              className={[s.beenBtn, marked && s.beenDone].filter(Boolean).join(' ')}
              onClick={(e) => {
                e.stopPropagation()
                if (!marked) onMarkBeen()
              }}
            >
              {marked ? <><FiCheck /> Been there</> : "I've been here"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
