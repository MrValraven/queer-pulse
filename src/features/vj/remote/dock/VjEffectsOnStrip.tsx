/**
 * The Effects on strip, directly above the effect pads: one chip per effect
 * that is on now, docked on a pad or not, with the strobe first while it
 * runs. It reads the dispatcher's optimistic on state (`isOnOf`), so a chip
 * comes and goes the moment a pad, a switch in the All effects sheet or a
 * chip is pressed. A chip turns its effect off through the pad's own send
 * path; All off turns every effect off at once (`turnAllEffectsOff`). A
 * refused send rolls the chip back and names its reason on the status line,
 * as a pad does. With nothing on, the phone strip folds away.
 *
 * One row in both layouts: a small badge with the count (the full "N effects
 * on" names the group), the chips scrolling sideways inside their own track
 * (an end fade while chips hide past its end edge), and All off as an icon
 * button pinned at the end. The split column keeps the row at all times,
 * with "No effects on" in the track and All off held while none is on, so
 * the pads under it keep their place and their column count. Sizes live in
 * VjEffectsOnStrip.module.css.
 */
import { AnimatePresence, m } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { FiPower, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  VJ_EFFECT_IDS,
  vjEffectSettingOf,
  type VjEffects,
} from "../../../../shared/contracts/vj";
import { Collapse } from "../../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";
import type { VjPadId } from "../rules/vjDockPads";
import { VjDockHelpLegend } from "./VjDockHelpLegend";
import type { VjPadSendHandler } from "./VjEffectPad";
import { vjPadLabelKey, vjShortLabelOf } from "./vjPadLabel";
import styles from "./VjEffectsOnStrip.module.css";

/** The app's base duration (--dur-base) and ease (--ease), as the pads use. */
const VJ_CHIP_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1] as const,
};
const VJ_CHIP_INSTANT = { duration: 0 };

/** The strobe while it runs, then every catalog effect that is on, in catalog order. */
function vjOnPadIdsOf(
  effects: VjEffects,
  isOnOf: (padId: VjPadId, serverIsOn: boolean) => boolean,
): VjPadId[] {
  const onPadIds: VjPadId[] = [];
  if (isOnOf("strobe", effects.isStrobing)) onPadIds.push("strobe");
  for (const effectId of VJ_EFFECT_IDS) {
    if (isOnOf(effectId, vjEffectSettingOf(effects, effectId).isOn)) {
      onPadIds.push(effectId);
    }
  }
  return onPadIds;
}

/**
 * True while the track hides chips past its end edge, which turns on
 * the end fade (the pads row reads its band the same way). It reads the
 * scroll position on scroll and whenever the track or a chip changes size.
 */
function useVjChipsHaveMoreAtEnd(
  chipsRef: RefObject<HTMLUListElement | null>,
  chipCount: number,
): boolean {
  const [hasMoreAtEnd, setHasMoreAtEnd] = useState(false);
  useEffect(() => {
    const chips = chipsRef.current;
    if (chips === null || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const readScroll = () => {
      // scrollLeft runs negative in right-to-left text, so its size counts.
      const hiddenAtEnd =
        chips.scrollWidth - chips.clientWidth - Math.abs(chips.scrollLeft);
      setHasMoreAtEnd(hiddenAtEnd > 1);
    };
    const observer = new ResizeObserver(readScroll);
    observer.observe(chips);
    for (const chipSlot of Array.from(chips.children)) {
      observer.observe(chipSlot);
    }
    chips.addEventListener("scroll", readScroll, { passive: true });
    return () => {
      observer.disconnect();
      chips.removeEventListener("scroll", readScroll);
    };
  }, [chipsRef, chipCount]);
  return hasMoreAtEnd;
}

/** After a chip is pressed, focus moves to its neighbour, or to All off when it was the last. */
function focusNeighbourOf(pressedChip: HTMLButtonElement): void {
  const strip = pressedChip.closest("[data-vj-effects-on]");
  if (strip === null) return;
  const chips = Array.from(
    strip.querySelectorAll<HTMLButtonElement>("[data-vj-effects-on-chip]"),
  );
  const pressedIndex = chips.indexOf(pressedChip);
  const neighbour =
    chips[pressedIndex + 1] ??
    chips[pressedIndex - 1] ??
    strip.querySelector<HTMLButtonElement>("[data-vj-effects-on-all-off]");
  if (neighbour !== null && neighbour !== pressedChip) neighbour.focus();
}

interface VjEffectsOnChipProps {
  padId: VjPadId;
  isPending: boolean;
  isBlocked: boolean;
  describedBy?: string;
  onTurnOff: (padId: VjPadId, chip: HTMLButtonElement) => void;
}

/** One effect that is on: its short pad name and an X; a tap turns it off. */
function VjEffectsOnChip({
  padId,
  isPending,
  isBlocked,
  describedBy,
  onTurnOff,
}: VjEffectsOnChipProps) {
  const { t, language, translateIn } = useTranslation();
  const label =
    padId === "strobe" ? t("vj:effects.strobe") : t(`vj:effect.name.${padId}`);
  const shortLabel = vjShortLabelOf(
    translateIn,
    language,
    vjPadLabelKey(padId),
    label,
  );
  return (
    <button
      type="button"
      className={styles.chip}
      data-vj-effects-on-chip={padId}
      aria-label={t("vj:effectsOn.turnOffAria", { effect: label })}
      aria-busy={isPending || undefined}
      aria-disabled={isBlocked}
      aria-describedby={describedBy}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (isBlocked) return;
        onTurnOff(padId, event.currentTarget);
      }}
    >
      <span className={styles.chipName} aria-hidden>
        {shortLabel}
      </span>
      <FiX aria-hidden focusable="false" fill="none" className={styles.x} />
    </button>
  );
}

export interface VjEffectsOnStripProps {
  effects: VjEffects;
  isOnOf: (padId: VjPadId, serverIsOn: boolean) => boolean;
  isPendingOf: (padId: VjPadId) => boolean;
  isBlocked: boolean;
  layout: "phone" | "split";
  /** The pads' touch send path (`actions.onPadSend`): a chip sends "off". */
  onPadSend: VjPadSendHandler;
  /** Turns every effect and a running strobe off (`actions.turnAllEffectsOff`). */
  onAllOff: () => void;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
}

export function VjEffectsOnStrip({
  effects,
  isOnOf,
  isPendingOf,
  isBlocked,
  layout,
  onPadSend,
  onAllOff,
  blockedReasonId,
}: VjEffectsOnStripProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { isOn: isHelpOn } = useVjHelpCaptions();
  const labelId = useId();
  const helpId = useId();
  const chipsRef = useRef<HTMLUListElement>(null);
  const onPadIds = vjOnPadIdsOf(effects, isOnOf);
  const onCount = onPadIds.length;
  // Chips glide when the set of effects on changes, and hold still while a
  // caption or a row above them moves the strip.
  const onIdsKey = onPadIds.join(" ");
  // Keeps the last count drawn while the phone strip folds away.
  const [shownCount, setShownCount] = useState(onCount);
  if (onCount > 0 && onCount !== shownCount) setShownCount(onCount);
  const isSplit = layout === "split";
  const isEmpty = onCount === 0;
  const hasMoreAtEnd = useVjChipsHaveMoreAtEnd(chipsRef, onCount);
  const transition = reducedMotion ? VJ_CHIP_INSTANT : VJ_CHIP_TRANSITION;
  const blockedDescription = isBlocked ? blockedReasonId : undefined;
  const isAllOffHeld = isBlocked || isEmpty;
  const allOffLabel = t("vj:effectsOn.allOff");
  const turnOff = (padId: VjPadId, chip: HTMLButtonElement) => {
    focusNeighbourOf(chip);
    onPadSend(padId, "off", chip);
  };
  return (
    <div className={styles.slot}>
      {/* The split column keeps the strip's room at all times, so the pads
          below never move; the phone band folds it away while none is on. */}
      <Collapse isOpen={isSplit || !isEmpty}>
        <div
          role="group"
          className={styles.strip}
          data-vj-effects-on=""
          data-layout={layout}
          aria-labelledby={labelId}
          aria-describedby={isHelpOn ? helpId : undefined}
        >
          <span id={labelId} className="visuallyHidden">
            {isEmpty && isSplit
              ? t("vj:effectsOn.none")
              : t("vj:effectsOn.count", { count: shownCount })}
          </span>
          <div className={styles.bar}>
            <span
              className={styles.countBadge}
              data-empty={isEmpty && isSplit}
              aria-hidden
            >
              {isEmpty && isSplit ? 0 : shownCount}
            </span>
            <div className={styles.track}>
              <ul
                ref={chipsRef}
                className={styles.chips}
                data-has-more-end={hasMoreAtEnd}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {onPadIds.map((padId) => (
                    <m.li
                      key={padId}
                      layout="position"
                      layoutDependency={onIdsKey}
                      className={styles.chipSlot}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={transition}
                    >
                      <VjEffectsOnChip
                        padId={padId}
                        isPending={isPendingOf(padId)}
                        isBlocked={isBlocked}
                        describedBy={blockedDescription}
                        onTurnOff={turnOff}
                      />
                    </m.li>
                  ))}
                </AnimatePresence>
              </ul>
              <AnimatePresence initial={false}>
                {isEmpty && isSplit && (
                  <m.p
                    key="none"
                    className={styles.none}
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transition}
                  >
                    {t("vj:effectsOn.none")}
                  </m.p>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              className={styles.allOff}
              data-vj-effects-on-all-off=""
              aria-label={allOffLabel}
              aria-disabled={isAllOffHeld}
              aria-describedby={blockedDescription}
              onClick={() => {
                if (!isAllOffHeld) onAllOff();
              }}
            >
              <FiPower aria-hidden focusable="false" fill="none" />
            </button>
          </div>
          <div className={styles.help}>
            <VjDockHelpLegend
              entries={[
                {
                  id: helpId,
                  term: t("vj:effectsOn.term"),
                  text: t("vj:help.effectsOn"),
                },
              ]}
            />
          </div>
        </div>
      </Collapse>
    </div>
  );
}
