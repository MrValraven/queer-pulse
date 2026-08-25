import { type SyntheticEvent } from "react";
import { FiMapPin, FiCheck, FiClock, FiBookmark } from "react-icons/fi";
import { FaWheelchair } from "react-icons/fa6";
import { ImageSlot, Stars } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSaved } from "../../app/providers/useSaved";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { routes } from "../../app/routeMap";
import {
  TYPE_LABEL_KEYS,
  VIBE_BG,
  VIBE_FG,
  VIBE_LABEL_KEYS,
  type Venue,
} from "./map.data";
import s from "./localMap.module.css";
import p from "./DirectoryPage.module.css";

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
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const savedId = `listing:venue:${v.id}`;
  const saved = isSaved(savedId);
  // Capped to 3 total (mirrors LocalBusinessCard's `pills.slice(0, 3)`) so a
  // venue with more vibe tags + accessibility never wraps to a second row.
  const pills = [
    ...v.vibe.map((vibe) => (
      <span
        key={vibe}
        className={s.vt}
        style={{ background: VIBE_BG[vibe], color: VIBE_FG[vibe] }}
      >
        {t(VIBE_LABEL_KEYS[vibe]!)}
      </span>
    )),
    <span key="price" className={p.pill}>
      {v.price}
    </span>,
    ...(v.accessible
      ? [
          <span key="accessible" className={p.pill}>
            <FaWheelchair aria-hidden />{" "}
            {t("marketing:map.venueCard.accessible")}
          </span>,
        ]
      : []),
  ].slice(0, 3);

  function handleSave(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    const nowSaved = toggleSave({
      id: savedId,
      kind: "listing",
      title: v.name,
      href: `${routes.venue}/${v.id}`,
      meta: v.bairro,
    });
    showToast(
      t(
        nowSaved
          ? "marketing:directory.card.savedToast"
          : "marketing:directory.card.unsavedToast",
        { name: v.name },
      ),
      nowSaved ? "success" : "info",
    );
  }

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
      <div className={p.photoWrap}>
        <ImageSlot
          src={v.photo}
          alt={v.name}
          height={140}
          style={{ borderRadius: "14px 14px 0 0" }}
        />
        <span className={`${p.photoBadge} ${p.photoBadgeDark}`}>
          {t("marketing:directory.badge.friendly")}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-pressed={saved}
          aria-label={t(
            saved
              ? "marketing:directory.card.unsaveAriaLabel"
              : "marketing:directory.card.saveAriaLabel",
            { name: v.name },
          )}
          className={`${p.saveBtn} ${saved ? p.saveBtnOn : ""}`}
          onClick={handleSave}
          onKeyDown={(e) => activateOnKey(e, () => handleSave(e))}
        >
          <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />
        </span>
      </div>

      <div className={p.nameRow}>
        <div className={s.vcName}>{v.name}</div>
        <div className={p.rating}>
          <Stars value={Number(v.rating.score)} size={12} />
          <span>({v.rating.count})</span>
        </div>
      </div>
      <div className={p.metaRow}>
        <span className={p.catPill}>{t(TYPE_LABEL_KEYS[v.type]!)}</span>
        <span className={p.hoodText}>{v.bairro}</span>
      </div>
      <div className={p.desc}>{v.note}</div>
      <div className={p.pillsRow}>{pills}</div>

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
