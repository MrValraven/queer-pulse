import { FiMapPin, FiCheck, FiClock } from "react-icons/fi";
import { FaWheelchair } from "react-icons/fa6";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  TYPE_BG,
  TYPE_FG,
  TYPE_ICON,
  TYPE_LABEL_KEYS,
  VIBE_BG,
  VIBE_FG,
  VIBE_LABEL_KEYS,
  type Venue,
} from "./map.data";
import s from "./localMap.module.css";

export function MapVenueCard({
  v,
  isExpanded,
  beenCount,
  marked,
  onToggle,
  onMarkBeen,
}: {
  v: Venue;
  isExpanded: boolean;
  beenCount: number;
  marked: boolean;
  onToggle: () => void;
  onMarkBeen: () => void;
}) {
  const { t } = useTranslation();
  const TypeIcon = TYPE_ICON[v.type];
  return (
    <div
      className={[s.vc, isExpanded && s.vcExpanded].filter(Boolean).join(" ")}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className={s.vcHead}>
        <span
          className={s.vcIcon}
          style={{ background: TYPE_BG[v.type], color: TYPE_FG[v.type] }}
        >
          {TypeIcon && <TypeIcon />}
        </span>
        <div className={s.vcInfo}>
          <div className={s.vcName}>{v.name}</div>
          <div className={s.vcBairro}>{v.bairro}</div>
        </div>
        <div className={s.vcRight}>
          <span
            className={s.vcTypeTag}
            style={{ background: TYPE_BG[v.type], color: TYPE_FG[v.type] }}
          >
            {t(TYPE_LABEL_KEYS[v.type]!)}
          </span>
          {v.accessible && (
            <span className={s.vcAccess}>
              <FaWheelchair />
            </span>
          )}
        </div>
      </div>
      <div className={s.vcVibes}>
        {v.vibe.map((vibe) => (
          <span
            key={vibe}
            className={s.vt}
            style={{ background: VIBE_BG[vibe], color: VIBE_FG[vibe] }}
          >
            {t(VIBE_LABEL_KEYS[vibe]!)}
          </span>
        ))}
      </div>
      <div className={s.vcReveal} data-open={isExpanded}>
        <div className={s.vcRevealInner}>
          <div className={s.vcBody} aria-hidden={!isExpanded}>
            <div className={s.vcRow}>
              <span className={s.vcRowIcon}>
                <FiMapPin />
              </span>
              <span>{v.address}</span>
            </div>
            <div className={s.vcRow}>
              <span className={s.vcRowIcon}>
                <FiClock />
              </span>
              <span>{v.hours}</span>
            </div>
            <div className={s.vcNote}>{v.note}</div>
            <div className={s.vcBeenRow}>
              <div className={s.beenCount}>
                <Translation
                  i18nKey="marketing:map.venueCard.beenCount"
                  values={{ count: beenCount }}
                  components={{ b: <b /> }}
                />
              </div>
              <button
                type="button"
                tabIndex={isExpanded ? 0 : -1}
                className={[s.beenBtn, marked && s.beenDone]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!marked) onMarkBeen();
                }}
              >
                {marked ? (
                  <>
                    <FiCheck /> {t("marketing:map.venueCard.beenThere")}
                  </>
                ) : (
                  t("marketing:map.venueCard.markBeen")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
