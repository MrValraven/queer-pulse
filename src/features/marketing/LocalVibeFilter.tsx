import { useId } from "react";
import { m } from "motion/react";
import { useRefineGlide } from "../../shared/components/ui";
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
  // Inside the Refine drawer the chips glide to their new places as the
  // drawer's content shifts; in the mobile sheet they stay still.
  const glide = useRefineGlide();

  return (
    <m.div
      {...glide.row}
      className={s.vibeRow}
      role="group"
      aria-labelledby={vibeLabelId}
    >
      <span className={s.vibeLabel} id={vibeLabelId}>
        {t("marketing:local.filter.vibeLabel")}
      </span>
      {VIBES.map((vibe) => (
        <m.button
          {...glide.chip}
          type="button"
          key={vibe}
          aria-pressed={vibes.includes(vibe)}
          className={[s.chip, s.vibe, vibes.includes(vibe) && s.chipOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onToggleVibe(vibe)}
        >
          {t(VIBE_LABEL_KEYS[vibe]!)}
        </m.button>
      ))}
      {vibes.length > 0 && (
        <span className={s.vibeNote}>
          {t("marketing:local.filter.vibeVenueNote")}
        </span>
      )}
    </m.div>
  );
}
