import { type ReactNode, type Ref } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { MeasuredHeightFrame } from "../../shared/components/layout/MeasuredHeightFrame";
import { ChipSelect } from "../../shared/components/ui";
import { CHIP_EASE } from "../../shared/components/ui/useChipMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { professionsForFields } from "./memberDirectoryFilter.data";
import type { ProfessionGroup } from "./workFieldPicker.data";
import { WorkProfessionResults } from "./WorkProfessionResults";
import styles from "./WorkFieldPicker.module.css";

/** How long the view on its way out takes to fade, in seconds. Short, so it
 *  is nearly gone before the next one shows. */
const VIEW_EXIT_DURATION = 0.12;
/** `--ease-in`: the view on its way out accelerates away. */
const VIEW_EXIT_EASE = [0.4, 0, 1, 1] as const;
/** How long the arriving view waits before it fades in, in seconds, so its
 *  chips never show through the view on its way out. */
const VIEW_ENTER_DELAY = 0.1;
/** How long the arriving view takes to fade in, in seconds. With the delay,
 *  the swap reads as one move of about 280ms. */
const VIEW_ENTER_DURATION = 0.18;

type ProfessionAreaView = "results" | "roles" | "prompt";

interface WorkProfessionAreaProps {
  /** The search's grouped results. Empty when there is no search, or when the
   *  search found nothing. */
  groups: ProfessionGroup[];
  /** The member's fields, whose roles show when there are no results. */
  discipline: string[];
  /** Whether the picker shows only the member's picks, which narrows the
   *  roles view to the selected roles. */
  isShowingOnlyPicks: boolean;
  /** `id` of the picker's "Your role" heading, which names the chip rows. */
  roleHeadingId: string;
  selected: Set<string>;
  onToggle: (professionId: string) => void;
}

/**
 * What sits under the picker's "Your role" heading: the search's results
 * grouped by field, else the roles of the member's fields, else the prompt,
 * which only a member with no field and no search reaches.
 *
 * Moving from one view to another crossfades: the view on its way out is
 * lifted out of the flow (`popLayout`) and fades over the one arriving, while
 * the frame around them eases to the new height, so the content below glides.
 * The prompt and the roles change height in one pass (a field picked or
 * dropped adds or takes away a row of chips), so the frame eases every
 * change there. Result groups fold open and closed on their own motion, so
 * the results sit at their natural height, letting a group's fold carry the
 * content below on its own curve. The swap into the results still glides:
 * the frame hands the height it had over as a margin that eases away
 * (`MeasuredHeightFrame`). Reduced motion makes every change instant.
 */
export function WorkProfessionArea({
  groups,
  discipline,
  isShowingOnlyPicks,
  roleHeadingId,
  selected,
  onToggle,
}: WorkProfessionAreaProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const view: ProfessionAreaView =
    groups.length > 0 ? "results" : discipline.length > 0 ? "roles" : "prompt";
  const shouldAnimateHeight = !reducedMotion && view !== "results";

  return (
    <MeasuredHeightFrame shouldAnimateHeight={shouldAnimateHeight}>
      <div className={styles.professionViews}>
        <AnimatePresence mode="popLayout" initial={false}>
          <ProfessionView key={view}>
            {view === "results" ? (
              <WorkProfessionResults
                groups={groups}
                roleHeadingId={roleHeadingId}
                selected={selected}
                onToggle={onToggle}
              />
            ) : view === "roles" ? (
              <ChipSelect
                isPresenceAnimated
                labelledBy={roleHeadingId}
                options={professionsForFields(discipline)
                  .filter(
                    (option) => !isShowingOnlyPicks || selected.has(option.id),
                  )
                  .map((option) => ({
                    value: option.id,
                    label: t(option.labelKey),
                  }))}
                selected={selected}
                onToggle={onToggle}
              />
            ) : (
              <p className={styles.prompt}>
                {t("members:workPicker.professionPrompt")}
              </p>
            )}
          </ProfessionView>
        </AnimatePresence>
      </div>
    </MeasuredHeightFrame>
  );
}

/** One view of the area, fading in or out. The view on its way out fades
 *  quickly and the next one waits a beat before fading in, so the two never
 *  read as one garbled layer. While it fades out it is `inert`, so a chip in
 *  a view on its way out can no longer be clicked or tabbed to.
 *  `ref` is the one AnimatePresence uses to measure the view before lifting
 *  it out. It is a `flow-root`, so a margin at the edge of its content (the
 *  result list's negative top margin) stays inside the view, and the view
 *  keeps its place when the next one arrives and when it is lifted out.
 *  Reduced motion (the OS setting or the in-app toggle) makes the swap
 *  instant. */
function ProfessionView({
  children,
  ref,
}: {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.div
      ref={ref}
      className={styles.professionView}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: reducedMotion
          ? { duration: 0 }
          : {
              delay: VIEW_ENTER_DELAY,
              duration: VIEW_ENTER_DURATION,
              ease: CHIP_EASE,
            },
      }}
      exit={{
        opacity: 0,
        transition: reducedMotion
          ? { duration: 0 }
          : { duration: VIEW_EXIT_DURATION, ease: VIEW_EXIT_EASE },
      }}
    >
      {children}
    </m.div>
  );
}
