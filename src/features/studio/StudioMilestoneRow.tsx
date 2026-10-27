import { useId } from "react";
import { m, useIsPresent } from "motion/react";
import { FiShare2 } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isRecentMilestone,
  type StudioMilestoneView,
} from "./api/studioDashboard.adapters";
import { milestoneSentenceOf } from "./studioMilestoneSentence";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
  studioStaggerDelay,
} from "./studioMotion";
import css from "./StudioMilestones.module.css";

/** One reached milestone: its sentence, the day it was reached, a "New" tag
 *  for the first week, and the button that opens its share dialog. */
export function StudioMilestoneRow({
  milestone,
  index,
  personaName,
  now,
  onShare,
}: {
  milestone: StudioMilestoneView;
  index: number;
  personaName: string;
  /** Read once per render of the card, so every row agrees on "New". */
  now: Date;
  onShare: (milestone: StudioMilestoneView) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const sentenceId = useId();
  const sentence = milestoneSentenceOf(milestone, personaName, fmt.number);
  const isNew = isRecentMilestone(milestone, now);
  const isPresent = useIsPresent();
  const collapsed = { opacity: 0, height: 0, overflow: "hidden" } as const;
  return (
    <m.li
      className={css.row}
      inert={!isPresent}
      initial={collapsed}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          ...STUDIO_DISCLOSURE,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE.duration,
          delay: reducedMotion ? 0 : studioStaggerDelay(index),
        },
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        ...collapsed,
        transition: {
          ...STUDIO_DISCLOSURE_EXIT,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE_EXIT.duration,
        },
      }}
    >
      <div className={css.rowInner}>
        <div className={css.rowText}>
          <p id={sentenceId} className={css.sentence}>
            {t(sentence.key, sentence.values)}
          </p>
          <p className={css.meta}>
            {t("studio:numbers.milestones.reachedOn", {
              date: fmt.date(milestone.reachedAt, { dateStyle: "medium" }),
            })}
            {isNew && (
              <span className={css.newTag}>
                {t("studio:numbers.milestones.new")}
              </span>
            )}
          </p>
        </div>
        <Button
          variant="quiet"
          size="sm"
          className={css.shareButton}
          aria-describedby={sentenceId}
          onClick={() => onShare(milestone)}
        >
          <FiShare2 aria-hidden="true" />
          {t("studio:numbers.milestones.shareCta")}
        </Button>
      </div>
    </m.li>
  );
}
