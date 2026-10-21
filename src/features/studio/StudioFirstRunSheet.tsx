import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, m, type Variants } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  FIRST_RUN_GENRES,
  FIRST_RUN_MOODS,
  FIRST_RUN_STEPS,
  firstRunStepAt,
} from "./studioFirstRun.data";
import { StudioFirstRunFollowStep } from "./StudioFirstRunFollow";
import { StudioFirstRunNav } from "./StudioFirstRunNav";
import {
  StudioFirstRunAboutStep,
  StudioFirstRunTasteStep,
} from "./StudioFirstRunSteps";
import { useStudioMeasuredHeight } from "./studioFirstRunHeight";
import type { StudioTaste } from "./studioFirstRunTaste";
import {
  STUDIO_EXIT,
  STUDIO_FADE,
  STUDIO_SPRING,
  STUDIO_SPRING_SOFT,
} from "./studioMotion";
import css from "./StudioFirstRun.module.css";

/** How far a step slides in from the side it comes from. */
const STEP_SLIDE_PX = 28;
const REDUCED_FADE = { duration: 0.12 } as const;

function stepVariants(isReduced: boolean): Variants {
  const offset = (direction: number) =>
    isReduced ? 0 : direction * STEP_SLIDE_PX;
  return {
    enter: (direction: number) => ({ opacity: 0, x: offset(direction) }),
    center: {
      opacity: 1,
      x: 0,
      transition: isReduced
        ? REDUCED_FADE
        : { x: STUDIO_SPRING_SOFT, opacity: STUDIO_FADE },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: offset(-direction),
      transition: isReduced ? REDUCED_FADE : STUDIO_EXIT,
    }),
  };
}

/** Three dots with one coral marker that springs to the current step, and
 *  "Step 2 of 3" read out politely as the step changes. */
function StudioFirstRunProgress({ stepIndex }: { stepIndex: number }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const step = firstRunStepAt(stepIndex);
  return (
    <span className={css.progress}>
      {/* Its own presence, so the marker's layout animation never holds up
          the dialog's exit. */}
      <AnimatePresence initial={false}>
        <span key="dots" className={css.dots} aria-hidden>
          {FIRST_RUN_STEPS.map((dotStep, index) => (
            <span
              key={dotStep.id}
              className={[css.dot, index < stepIndex && css.dotDone]
                .filter(Boolean)
                .join(" ")}
            >
              {index === stepIndex && (
                <m.span
                  layoutId="studio-first-run-dot"
                  className={css.dotMarker}
                  transition={reducedMotion ? { duration: 0 } : STUDIO_SPRING}
                />
              )}
            </span>
          ))}
        </span>
      </AnimatePresence>
      <span role="status" className={css.stepCount}>
        {t("studio:firstRun.progress", {
          current: stepIndex + 1,
          total: FIRST_RUN_STEPS.length,
        })}
        <span className="visuallyHidden"> {t(step.nameKey)}</span>
      </span>
    </span>
  );
}

/** The step's serif heading, crossfading with the step body. It takes
 *  focus when the welcome opens, so a screen reader starts on the step's
 *  name. */
function StudioFirstRunTitle({
  stepIndex,
  headingRef,
}: {
  stepIndex: number;
  headingRef: RefObject<HTMLSpanElement | null>;
}) {
  const { reducedMotion } = useMotionPrefs();
  const step = firstRunStepAt(stepIndex);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.span
        key={step.id}
        ref={headingRef}
        tabIndex={-1}
        className={css.title}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: reducedMotion ? REDUCED_FADE : STUDIO_FADE,
        }}
        exit={{
          opacity: 0,
          transition: reducedMotion ? REDUCED_FADE : STUDIO_EXIT,
        }}
      >
        <Translation i18nKey={step.titleKey} components={{ em: <em /> }} />
      </m.span>
    </AnimatePresence>
  );
}

function toggled(previous: Set<string>, value: string): Set<string> {
  const next = new Set(previous);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

/**
 * The welcome dialog: the shared Modal, a bottom sheet on phones and a
 * centred dialog on desktop, with its focus trap, Escape and focus return.
 * The step heading takes focus on open. Steps slide in from the side they
 * come from and the body springs to each step's height on the same soft
 * spring; the footer stays put, so focus stays on Next from step to step.
 */
export interface StudioFirstRunSheetProps {
  initialTaste: StudioTaste | null;
  /** `isFinished` is true for Start listening, false for every other exit. */
  onClose: (picks: StudioTaste, isFinished: boolean) => void;
}

export function StudioFirstRunSheet({
  initialTaste,
  onClose,
}: StudioFirstRunSheetProps) {
  const { reducedMotion } = useMotionPrefs();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [genres, setGenres] = useState<Set<string>>(
    () => new Set(initialTaste?.genres ?? []),
  );
  const [moods, setMoods] = useState<Set<string>>(
    () => new Set(initialTaste?.moods ?? []),
  );
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
  const { ref: stepBoxRef, height: stepHeight } =
    useStudioMeasuredHeight<HTMLDivElement>();
  const step = firstRunStepAt(stepIndex);
  const isLastStep = stepIndex === FIRST_RUN_STEPS.length - 1;

  // In the vocabulary's own order, so the stored record reads the same
  // whatever order the chips were tapped in.
  const picks = useMemo<StudioTaste>(
    () => ({
      genres: FIRST_RUN_GENRES.map((choice) => choice.value).filter((genre) =>
        genres.has(genre),
      ),
      moods: FIRST_RUN_MOODS.map((choice) => choice.value).filter((mood) =>
        moods.has(mood),
      ),
    }),
    [genres, moods],
  );

  const goTo = (index: number) => {
    setDirection(index > stepIndex ? 1 : -1);
    setStepIndex(index);
  };
  const goBack = () => {
    const previousIndex = Math.max(0, stepIndex - 1);
    goTo(previousIndex);
    // Back leaves with step 1, so focus moves on to Next before it goes.
    if (previousIndex === 0) nextButtonRef.current?.focus();
  };
  const goNext = () => {
    if (isLastStep) onClose(picks, true);
    else goTo(stepIndex + 1);
  };

  let body: ReactNode;
  if (step.id === "about") body = <StudioFirstRunAboutStep />;
  else if (step.id === "taste")
    body = (
      <StudioFirstRunTasteStep
        genres={genres}
        moods={moods}
        onToggleGenre={(genre) =>
          setGenres((previous) => toggled(previous, genre))
        }
        onToggleMood={(mood) => setMoods((previous) => toggled(previous, mood))}
      />
    );
  else body = <StudioFirstRunFollowStep taste={picks} />;

  return (
    <Modal
      eyebrow={<StudioFirstRunProgress stepIndex={stepIndex} />}
      title={
        <StudioFirstRunTitle stepIndex={stepIndex} headingRef={headingRef} />
      }
      onClose={() => onClose(picks, false)}
      initialFocusRef={headingRef}
      className={css.sheet}
      bodyClassName={css.body}
      footer={
        <StudioFirstRunNav
          stepIndex={stepIndex}
          isLastStep={isLastStep}
          nextButtonRef={nextButtonRef}
          onSkip={() => onClose(picks, false)}
          onBack={goBack}
          onNext={goNext}
        />
      }
    >
      <m.div
        className={css.stepFrame}
        initial={false}
        animate={stepHeight === null ? undefined : { height: stepHeight }}
        transition={reducedMotion ? REDUCED_FADE : STUDIO_SPRING_SOFT}
      >
        <div ref={stepBoxRef} className={css.stepBox}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <m.div
              key={step.id}
              className={css.panel}
              custom={direction}
              variants={stepVariants(reducedMotion)}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {body}
            </m.div>
          </AnimatePresence>
        </div>
      </m.div>
    </Modal>
  );
}
