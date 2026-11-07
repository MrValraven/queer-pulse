import { useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjHistoryStrip, type VjHistoryStripProps } from "./VjHistoryStrip";
import { VjScenesStrip, type VjScenesStripProps } from "./VjScenesStrip";
import styles from "./VjStrips.module.css";

export type { VjHistoryStripProps } from "./VjHistoryStrip";
export type { VjScenesStripProps } from "./VjScenesStrip";

/** The app's ease token (--ease) at its fast duration (--dur-fast). */
const VJ_STRIPS_FADE = { duration: 0.15, ease: [0.22, 0.68, 0.16, 1] as const };
const VJ_STRIPS_INSTANT = { duration: 0 };

type VjStripSegment = "scenes" | "recent";

const VJ_STRIP_SEGMENTS: readonly {
  id: VjStripSegment;
  labelKey: string;
}[] = [
  { id: "scenes", labelKey: "vj:strip.scenes" },
  { id: "recent", labelKey: "vj:strip.recent" },
];

export interface VjStripsProps {
  /** useVjRemoteLayout().isCompactStrips (VJ_COMPACT_STRIPS_QUERY): one row with a switch. */
  isCompact: boolean;
  scenesProps: VjScenesStripProps;
  historyProps: VjHistoryStripProps;
}

interface VjStripSwitchProps {
  segment: VjStripSegment;
  onSegment: (segment: VjStripSegment) => void;
}

function VjStripSwitch({
  segment,
  onSegment,
}: VjStripSwitchProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div
      className={styles.switch}
      role="group"
      aria-label={t("vj:strip.switchAria")}
      data-vj-strip-switch=""
    >
      {VJ_STRIP_SEGMENTS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={styles.segment}
          data-vj-strip-segment={option.id}
          aria-pressed={segment === option.id}
          onClick={() => onSegment(option.id)}
        >
          <span className={styles.segmentFace}>{t(option.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * The strips band between the sticky header and the clip grid: the scenes
 * strip over the history strip, two 36px rows that scroll sideways. On a
 * short viewport or a short installed app (`isCompact`) they share one row
 * behind a Scenes and Recent switch that cross-fades between them.
 */
export function VjStrips({
  isCompact,
  scenesProps,
  historyProps,
}: VjStripsProps): JSX.Element {
  const { reducedMotion } = useMotionPrefs();
  const [segment, setSegment] = useState<VjStripSegment>("scenes");
  const transition = reducedMotion ? VJ_STRIPS_INSTANT : VJ_STRIPS_FADE;

  if (!isCompact) {
    return (
      <div className={styles.strips} data-vj-strips="">
        <VjScenesStrip {...scenesProps} />
        <VjHistoryStrip {...historyProps} />
      </div>
    );
  }

  return (
    <div className={styles.strips} data-vj-strips="" data-compact="true">
      <div className={styles.compactRow}>
        <VjStripSwitch segment={segment} onSegment={setSegment} />
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={segment}
            className={styles.compactSlot}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
          >
            {segment === "scenes" ? (
              <VjScenesStrip {...scenesProps} />
            ) : (
              <VjHistoryStrip {...historyProps} />
            )}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
