import { AnimatePresence, m } from "motion/react";
import { useId, useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { IconButton } from "../../../shared/components/ui/IconButton";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  splitControlsForNarrowBar,
  type SecondaryControl,
} from "./quizshowRemoteSecondaryControls";
import styles from "./QuizshowRemote.module.css";

/** From this many controls the labels shrink so a long one such as Finish the wheel stays on one line. */
const CROWDED_ROW_FROM = 4;
/** Below 400px the foldable controls wait behind "More controls", so the bar keeps one row. */
const NARROW_BAR_QUERY = "(max-width: 399.98px)";

/** One icon button of the secondary row, with the face that fades when Pause turns into Resume. */
function QuizshowRemoteSecondaryButton({
  control,
  isBlocked,
  onBeforeActivate,
}: {
  control: Pick<SecondaryControl, "labelKey" | "icon" | "onActivate">;
  isBlocked: boolean;
  /** Runs first on a tap that goes through, before the control acts. */
  onBeforeActivate?: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const label = t(control.labelKey);
  return (
    <IconButton
      className={styles.secondaryButton}
      tone="dark"
      aria-label={label}
      aria-disabled={isBlocked}
      onClick={() => {
        if (isBlocked) return;
        onBeforeActivate?.();
        control.onActivate();
      }}
    >
      {/* Pause and Resume keep one button, so only its face fades. */}
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={control.labelKey}
          className={styles.secondaryFace}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {control.icon}
          <span className={styles.secondaryLabel}>{label}</span>
        </m.span>
      </AnimatePresence>
    </IconButton>
  );
}

/**
 * The secondary row: one icon button per control, folding in and out as the
 * phase changes. On a narrow phone Add time waits behind a "More controls"
 * button that opens it as a second row, so the bar never grows to two rows by
 * itself. A control used from that second row hands focus back to the More
 * button first, so a dialog it opens (or the keyboard) returns to a node that
 * outlives the fold.
 */
export function QuizshowRemoteSecondaryRow({
  controls,
  isPending,
}: {
  controls: SecondaryControl[];
  isPending: (name: SecondaryControl["name"]) => boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isNarrow = useMediaQuery(NARROW_BAR_QUERY);
  const moreId = useId();
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { visible, folded } = isNarrow
    ? splitControlsForNarrowBar(controls)
    : { visible: controls, folded: [] };
  const hasFolded = folded.length > 0;
  if (isMoreOpen && !hasFolded) setIsMoreOpen(false);
  const buttonCount = visible.length + (hasFolded ? 1 : 0);
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  const popMotion = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: fade,
  };
  return (
    <>
      <div
        className={styles.secondaryRow}
        data-is-crowded={buttonCount >= CROWDED_ROW_FROM}
        data-has-more={hasFolded}
      >
        <AnimatePresence initial={false}>
          {visible.map((control) => (
            <m.div key={control.key} layout="position" {...popMotion}>
              <QuizshowRemoteSecondaryButton
                control={control}
                isBlocked={control.isBlocked || isPending(control.name)}
              />
            </m.div>
          ))}
          {hasFolded && (
            <m.div key="more" layout="position" {...popMotion}>
              <IconButton
                ref={moreButtonRef}
                className={styles.secondaryButton}
                tone="dark"
                aria-label={t("quizshow:remote.moreControls")}
                aria-expanded={isMoreOpen}
                aria-controls={moreId}
                onClick={() => setIsMoreOpen((wasOpen) => !wasOpen)}
              >
                <span className={styles.secondaryFace}>
                  <FiMoreHorizontal aria-hidden="true" fill="none" />
                  <span className={styles.secondaryLabel}>
                    {t("quizshow:remote.more")}
                  </span>
                </span>
              </IconButton>
            </m.div>
          )}
        </AnimatePresence>
      </div>
      <div id={moreId}>
        <Collapse isOpen={isMoreOpen && hasFolded}>
          <div className={styles.secondaryRow} data-is-crowded="false">
            {folded.map((control) => (
              <div key={control.key}>
                <QuizshowRemoteSecondaryButton
                  control={control}
                  isBlocked={control.isBlocked || isPending(control.name)}
                  onBeforeActivate={() => {
                    moreButtonRef.current?.focus();
                    setIsMoreOpen(false);
                  }}
                />
              </div>
            ))}
          </div>
        </Collapse>
      </div>
    </>
  );
}
