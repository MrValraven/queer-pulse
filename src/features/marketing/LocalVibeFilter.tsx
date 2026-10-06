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
  vibeCounts,
  isLoadedSetComplete,
}: {
  vibes: string[];
  onToggleVibe: (vibe: string) => void;
  /** How many loaded places would remain with each vibe added to the chosen
   *  ones. */
  vibeCounts: Record<string, number>;
  /** True once every page of places has loaded, so a zero count is final. */
  isLoadedSetComplete: boolean;
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
      {VIBES.map((vibe) => {
        const isOn = vibes.includes(vibe);
        // A vibe that would empty the list goes unpickable once the whole set
        // has loaded. A chosen vibe stays clickable so it can be undone.
        const isDisabled =
          isLoadedSetComplete && !isOn && (vibeCounts[vibe] ?? 0) === 0;
        return (
          <m.button
            {...glide.chip}
            type="button"
            key={vibe}
            aria-pressed={isOn}
            disabled={isDisabled}
            className={[s.chip, s.vibe, isOn && s.chipOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onToggleVibe(vibe)}
          >
            {t(VIBE_LABEL_KEYS[vibe]!)}
          </m.button>
        );
      })}
      {vibes.length > 0 && (
        <span className={s.vibeNote}>
          {t("marketing:local.filter.vibeVenueNote")}
        </span>
      )}
    </m.div>
  );
}
