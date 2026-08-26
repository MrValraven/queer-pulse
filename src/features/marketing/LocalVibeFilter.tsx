import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { VIBES, VIBE_LABEL_KEYS } from "./map.data";
import s from "./LocalFilterBar.module.css";

/**
 * The vibe chips (Cozy / Loud / Chill).
 *
 * Demo-only, and the caller decides that: vibe data lives on `map.data`'s
 * venues, and a real business has no vibe-tag field at all, so these chips
 * would silently do nothing to a live listing.
 */
export function LocalVibeFilter({
  vibes,
  onToggleVibe,
}: {
  vibes: string[];
  onToggleVibe: (vibe: string) => void;
}) {
  const { t } = useTranslation();
  const vibeLabelId = useId();

  return (
    <div className={s.vibeRow} role="group" aria-labelledby={vibeLabelId}>
      <span className={s.vibeLabel} id={vibeLabelId}>
        {t("marketing:local.filter.vibeLabel")}
      </span>
      {VIBES.map((vibe) => (
        <button
          type="button"
          key={vibe}
          aria-pressed={vibes.includes(vibe)}
          className={[s.chip, s.vibe, vibes.includes(vibe) && s.chipOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onToggleVibe(vibe)}
        >
          {t(VIBE_LABEL_KEYS[vibe]!)}
        </button>
      ))}
      {vibes.length > 0 && (
        <span className={s.vibeNote}>
          {t("marketing:local.filter.vibeVenueNote")}
        </span>
      )}
    </div>
  );
}
