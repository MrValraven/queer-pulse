import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import type { IconType } from "react-icons";
import {
  FiChevronRight,
  FiEdit3,
  FiMonitor,
  FiSmartphone,
} from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import {
  QuizshowStudioPhonePreview,
  QuizshowStudioPreviewFrame,
  QuizshowStudioScreenPreview,
  type QuizshowStudioScreenMoment,
} from "./QuizshowStudioPreviewFrame";
import { QuizshowStudioSlide } from "./QuizshowStudioSlide";
import { QuizshowStudioStart } from "./QuizshowStudioStart";
import styles from "./QuizshowStudioCanvas.module.css";

type CanvasMode = "edit" | "screen" | "phone";

interface SegmentChoice<Value extends string> {
  value: Value;
  labelKey: string;
  icon?: IconType;
}

const MODE_CHOICES: readonly SegmentChoice<CanvasMode>[] = [
  {
    value: "edit",
    labelKey: "quizshow:studio.canvas.mode.edit",
    icon: FiEdit3,
  },
  {
    value: "screen",
    labelKey: "quizshow:studio.canvas.mode.screen",
    icon: FiMonitor,
  },
  {
    value: "phone",
    labelKey: "quizshow:studio.canvas.mode.phone",
    icon: FiSmartphone,
  },
];

const MOMENT_CHOICES: readonly SegmentChoice<QuizshowStudioScreenMoment>[] = [
  { value: "open", labelKey: "quizshow:studio.canvas.moment.open" },
  { value: "reveal", labelKey: "quizshow:studio.canvas.moment.reveal" },
];

const SWAP_EASE = [0.22, 0.68, 0.16, 1] as const;

/** A segmented switch: native radios, so arrow keys move between the choices. */
function SegmentSwitch<Value extends string>({
  legendKey,
  choices,
  value,
  onChange,
}: {
  legendKey: string;
  choices: readonly SegmentChoice<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}) {
  const { t } = useTranslation();
  const name = useId();
  return (
    <fieldset className={styles.segment}>
      <legend className={styles.visuallyHidden}>{t(legendKey)}</legend>
      {choices.map((choice) => {
        const ChoiceIcon = choice.icon;
        return (
          <label key={choice.value} className={styles.segmentOption}>
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={choice.value === value}
              onChange={() => onChange(choice.value)}
            />
            {ChoiceIcon && <ChoiceIcon aria-hidden="true" focusable="false" />}
            {t(choice.labelKey)}
          </label>
        );
      })}
    </fieldset>
  );
}

/** Where the selection sits: "Round 2 > Question 3 of 6", or the title slide. */
function CanvasCrumbs() {
  const { t } = useTranslation();
  const { selection, controller } = useQuizshowStudio();
  let roundCrumb: string | null = null;
  let current = t("quizshow:studio.canvas.titleSlide");
  if (selection.kind !== "quiz") {
    roundCrumb = t("quizshow:rounds.untitled", {
      number: selection.roundIndex + 1,
    });
    current = t("quizshow:studio.canvas.roundIntro");
  }
  if (selection.kind === "question") {
    current = t("quizshow:stage.questionOf", {
      number: selection.questionIndex + 1,
      total:
        controller.draft.rounds[selection.roundIndex]?.questions.length ?? 0,
    });
  }
  return (
    <p className={styles.crumbs}>
      {roundCrumb !== null && (
        <>
          <span>{roundCrumb}</span>
          <FiChevronRight aria-hidden="true" focusable="false" />
          <span className={styles.visuallyHidden}>, </span>
        </>
      )}
      <span className={styles.crumbCurrent}>{current}</span>
    </p>
  );
}

/**
 * True until the canvas has painted once. The slide's "big enough to type
 * on" verdict is measured before the first paint, and a swap it causes then
 * must be instant, so a load below the threshold never shows Edit fading out.
 */
function useIsBeforeFirstPaint(): boolean {
  const [isBeforeFirstPaint, setIsBeforeFirstPaint] = useState(true);
  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsBeforeFirstPaint(false));
    return () => cancelAnimationFrame(frameId);
  }, []);
  return isBeforeFirstPaint;
}

const INSTANT_FOLD = { duration: 0, ease: SWAP_EASE } as const;

/** A view of the canvas that fades in over the last one (instantly before the first paint). */
function CanvasView({
  viewKey,
  isInstant,
  children,
}: {
  viewKey: string;
  isInstant: boolean;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={viewKey}
        className={styles.view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: reducedMotion || isInstant ? 0 : 0.2,
          ease: SWAP_EASE,
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

/**
 * The studio's centre: the selected slide drawn as the TV will show it. From
 * the wide layout up the host types straight onto it (Edit); Big screen draws
 * the real stage renderer, with the answering moment or the reveal, and Phone
 * the player's view in a phone frame. Below the wide layout the slide is a
 * read-only preview and editing happens in the inspector. An empty quiz shows
 * the start panel.
 */
export function QuizshowStudioCanvas() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { hasQuiz, isWide, selection, slideEditing } = useQuizshowStudio();
  const [mode, setMode] = useState<CanvasMode>("edit");
  const [moment, setMoment] = useState<QuizshowStudioScreenMoment>("open");
  const isBeforeFirstPaint = useIsBeforeFirstPaint();
  if (!hasQuiz) {
    return (
      <section
        className={styles.root}
        aria-label={t("quizshow:studio.canvas.label")}
      >
        <QuizshowStudioStart />
      </section>
    );
  }
  // Typing on the slide needs the wide layout and a slide drawn big enough to
  // read; otherwise Edit falls back to Big screen and the inspector edits.
  const isEditable = slideEditing.isEditable;
  const shownMode: CanvasMode =
    !isEditable && mode === "edit" ? "screen" : mode;
  const modeChoices = isEditable
    ? MODE_CHOICES
    : MODE_CHOICES.filter((choice) => choice.value !== "edit");
  const isMomentShown = shownMode === "screen" && selection.kind === "question";
  return (
    <section
      className={styles.root}
      data-layout={isWide ? "wide" : "narrow"}
      aria-label={t("quizshow:studio.canvas.label")}
    >
      <div className={styles.bar}>
        <CanvasCrumbs />
        <div className={styles.switches}>
          <AnimatePresence initial={false}>
            {isMomentShown && (
              <m.div
                key="moment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                <SegmentSwitch
                  legendKey="quizshow:studio.canvas.moment.legend"
                  choices={MOMENT_CHOICES}
                  value={moment}
                  onChange={setMoment}
                />
              </m.div>
            )}
          </AnimatePresence>
          <SegmentSwitch
            legendKey="quizshow:studio.canvas.mode.legend"
            choices={modeChoices}
            value={shownMode}
            onChange={setMode}
          />
        </div>
      </div>
      <CanvasView viewKey={shownMode} isInstant={isBeforeFirstPaint}>
        {shownMode === "edit" && (
          <QuizshowStudioPreviewFrame
            variant="screen"
            label={t("quizshow:studio.canvas.editFrame")}
            onScaleChange={slideEditing.reportCanvasScale}
          >
            <QuizshowStudioSlide />
          </QuizshowStudioPreviewFrame>
        )}
        {shownMode === "screen" && (
          <QuizshowStudioScreenPreview
            moment={moment}
            onScaleChange={slideEditing.reportCanvasScale}
          />
        )}
        {shownMode === "phone" && (
          <QuizshowStudioPhonePreview
            onScaleChange={slideEditing.reportCanvasScale}
          />
        )}
      </CanvasView>
      <Collapse
        isOpen={!isEditable}
        transition={isBeforeFirstPaint ? INSTANT_FOLD : undefined}
      >
        <p className={styles.narrowHint}>
          {t(
            isWide
              ? "quizshow:studio.canvas.sideHint"
              : "quizshow:studio.canvas.narrowHint",
          )}
        </p>
      </Collapse>
    </section>
  );
}
