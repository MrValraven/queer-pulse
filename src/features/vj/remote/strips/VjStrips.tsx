import { useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCornerUpLeft,
  FiList,
  FiPlus,
} from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjHelpDescribedBy } from "../top/useVjHelpDescribedBy";
import {
  VjHelpLegend,
  VjHelpMarker,
  VjHelpThumbMarker,
  type VjHelpLegendItem,
} from "../top/VjHelpLegend";
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
  helpCaptionId: string;
}[] = [
  { id: "scenes", labelKey: "vj:strip.scenes", helpCaptionId: "scenesTab" },
  { id: "recent", labelKey: "vj:strip.recent", helpCaptionId: "recentTab" },
];

const VJ_LEGEND_ICON_PROPS = {
  "aria-hidden": true,
  focusable: false,
  fill: "none",
} as const;

/** The strips' help legend: the switch, then each control in the scenes and history rows. */
function useVjStripsLegendItems({
  isCompact,
  scenesProps,
  historyProps,
}: VjStripsProps): VjHelpLegendItem[] {
  const { t } = useTranslation();
  const items: VjHelpLegendItem[] = [];
  if (isCompact) {
    items.push(
      {
        id: "scenesTab",
        marker: <VjHelpMarker label={t("vj:strip.scenes")} />,
        text: t("vj:help.scenesTab"),
      },
      {
        id: "recentTab",
        marker: <VjHelpMarker label={t("vj:strip.recent")} />,
        text: t("vj:help.recentTab"),
      },
    );
  }
  if (scenesProps.activeSetlist !== null) {
    items.push({
      id: "setlistStep",
      marker: (
        <VjHelpMarker
          icon={
            <>
              <FiChevronLeft {...VJ_LEGEND_ICON_PROPS} />
              <FiChevronRight {...VJ_LEGEND_ICON_PROPS} />
            </>
          }
        />
      ),
      text: t("vj:help.setlistStep"),
    });
  }
  const firstScene = scenesProps.scenes[0];
  if (firstScene !== undefined) {
    items.push({
      id: "sceneChip",
      marker: <VjHelpMarker label={firstScene.name} />,
      text: t("vj:help.sceneChip"),
    });
  }
  items.push({
    id: "saveScene",
    marker: (
      <VjHelpMarker
        icon={<FiPlus {...VJ_LEGEND_ICON_PROPS} />}
        label={t("vj:strip.saveScene")}
      />
    ),
    text: t("vj:help.saveScene"),
  });
  if (scenesProps.onOpenScenesSheet !== undefined) {
    items.push({
      id: "sceneList",
      marker: <VjHelpMarker icon={<FiList {...VJ_LEGEND_ICON_PROPS} />} />,
      text: t("vj:help.sceneList"),
    });
  }
  items.push({
    id: "previousClip",
    marker: (
      <VjHelpMarker
        icon={<FiCornerUpLeft {...VJ_LEGEND_ICON_PROPS} />}
        label={t("vj:strip.previous")}
      />
    ),
    text: t("vj:help.previousClip"),
  });
  const newestClip = historyProps.recentClipIds
    .map((clipId) => historyProps.clipsById.get(clipId))
    .find((clip) => clip !== undefined);
  if (newestClip !== undefined) {
    items.push({
      id: "recentClip",
      marker: <VjHelpThumbMarker thumbnailUrl={newestClip.thumbnailUrl} />,
      text: t("vj:help.recentClip"),
    });
  }
  return items;
}

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
  const helpDescribedBy = useVjHelpDescribedBy();
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
          aria-describedby={helpDescribedBy(option.helpCaptionId)}
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
 * behind a Scenes and Recent switch that cross-fades between them. While
 * help captions are on, a legend folds open under the strips.
 */
export function VjStrips({
  isCompact,
  scenesProps,
  historyProps,
}: VjStripsProps): JSX.Element {
  const { reducedMotion } = useMotionPrefs();
  const [segment, setSegment] = useState<VjStripSegment>("scenes");
  const transition = reducedMotion ? VJ_STRIPS_INSTANT : VJ_STRIPS_FADE;
  const legendItems = useVjStripsLegendItems({
    isCompact,
    scenesProps,
    historyProps,
  });
  const legend = <VjHelpLegend items={legendItems} placement="after" />;

  if (!isCompact) {
    return (
      <>
        <div className={styles.strips} data-vj-strips="">
          <VjScenesStrip {...scenesProps} />
          <VjHistoryStrip {...historyProps} />
        </div>
        {legend}
      </>
    );
  }

  return (
    <>
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
      {legend}
    </>
  );
}
