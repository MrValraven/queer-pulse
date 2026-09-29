import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { AnimatePresence, animate, m } from "motion/react";
import { FiChevronDown, FiSliders } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useFormat } from "../../i18n/format";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./RefineDrawer.module.css";
import { RollingNumber } from "./RollingNumber";
import { useChipMotion } from "./useChipMotion";
import { RefineGlideContext } from "./useRefineGlide";

/** The drawer content's height glide, eased like `--ease`. */
const PANEL_GLIDE_SECONDS = 0.26;
const PANEL_GLIDE_EASE = [0.22, 0.68, 0.16, 1] as const;

/** Resizes closer together than this come from content easing its own
 *  height frame by frame, including a script-driven ease that
 *  `getAnimations` cannot list. Two frames at 60Hz sit about 17ms apart. */
const SELF_ANIMATING_GAP_MS = 40;

/** CSS properties whose animation changes the content's height every frame
 *  (kebab case, as a transition names them). */
const HEIGHT_DRIVING_PROPERTY =
  /^(min-|max-)?(height|block-size)$|^grid-template-rows$|^(padding|margin)-(top|bottom|block)/;

/** Every property an animation touches, in kebab case. A CSS transition
 *  names its one property; any other animation lists them in its keyframes,
 *  keyed in camel case. */
function animatedProperties(animation: Animation): string[] {
  if ("transitionProperty" in animation) {
    return [String(animation.transitionProperty)];
  }
  const effect = animation.effect;
  if (!(effect instanceof KeyframeEffect)) return [];
  return effect
    .getKeyframes()
    .flatMap((keyframe) => Object.keys(keyframe))
    .map((key) =>
      key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
    );
}

/** True while something inside `measured` runs an animation on its height,
 *  such as a tray opening on a `grid-template-rows` transition. Opacity and
 *  transform animations (a tick popping in, chips gliding) leave the height
 *  alone and do not count. */
function isAnimatingOwnHeight(measured: HTMLElement): boolean {
  if (typeof measured.getAnimations !== "function") return false;
  return measured
    .getAnimations({ subtree: true })
    .some(
      (animation) =>
        animation.playState === "running" &&
        animatedProperties(animation).some((property) =>
          HEIGHT_DRIVING_PROPERTY.test(property),
        ),
    );
}

/** The count badge's hidden state. Its start margin begins at minus the
 *  toggle's flex gap (`gap: 8px` on `.toggle` in RefineDrawer.module.css), so
 *  the gap opens together with the badge and the pill widens smoothly. A
 *  string with a unit, because motion has no default unit for the logical
 *  margin properties. */
const HIDDEN_COUNT = {
  width: 0,
  opacity: 0,
  scale: 0.6,
  marginInlineStart: "-8px",
};

/**
 * The "Refine" pill that opens the drawer.
 *
 * It carries the count of everything currently narrowing the list from inside
 * the drawer, so a closed drawer still says that filters are applied. What
 * those filters ARE is a separate job, answered by `ActiveFilters`.
 */
export function RefineToggle({
  isOpen,
  panelId,
  onToggle,
  activeCount = 0,
  className,
}: {
  isOpen: boolean;
  panelId: string;
  onToggle: () => void;
  /** Active filters living inside the drawer. Zero hides the badge. */
  activeCount?: number;
  className?: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { transition } = useChipMotion();

  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <FiSliders aria-hidden />
      {t("shared:refine.label")}
      {/* The badge pops in and out on its own clipping slot, so its width
          can ease while the pill inside keeps its full size. A page that
          loads with filters on shows it at once. */}
      <AnimatePresence initial={false}>
        {activeCount > 0 && (
          <m.span
            key="count"
            className={styles.countSlot}
            aria-hidden
            initial={HIDDEN_COUNT}
            animate={{
              width: "auto",
              opacity: 1,
              scale: 1,
              marginInlineStart: "0px",
            }}
            exit={HIDDEN_COUNT}
            transition={transition}
          >
            <span className={styles.count}>
              <RollingNumber
                value={fmt.number(activeCount)}
                numericValue={activeCount}
              />
            </span>
          </m.span>
        )}
      </AnimatePresence>
      <span
        className={[styles.chevron, isOpen && styles.chevronOpen]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        <FiChevronDown />
      </span>
    </button>
  );
}

/**
 * The drawer itself: a paper panel whose DIRECT CHILDREN each become a band,
 * separated by a hairline. Pass one element per group.
 *
 * The body stays mounted so it can animate open AND closed; `inert` keeps the
 * hidden groups out of tab order and off screen readers meanwhile.
 */
export function RefinePanel({
  isOpen,
  isSettled,
  panelId,
  isFlat = false,
  children,
}: {
  isOpen: boolean;
  isSettled: boolean;
  panelId: string;
  /** Drops the panel's own border, background and side padding, leaving one
   *  hairline above the groups. For a drawer opened inside a surface that is
   *  already a card, where a second card would double the border. */
  isFlat?: boolean;
  children: ReactNode;
}) {
  const { sizerRef, measureRef } = usePanelHeightGlide(isOpen, isSettled);

  return (
    <div
      className={[styles.wrap, isOpen && styles.wrapOpen]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        id={panelId}
        className={[styles.body, isSettled && styles.bodyOpen]
          .filter(Boolean)
          .join(" ")}
        inert={!isOpen || undefined}
      >
        <div ref={sizerRef}>
          <div ref={measureRef} className={styles.measure}>
            <div
              className={[styles.panel, isFlat && styles.panelFlat]
                .filter(Boolean)
                .join(" ")}
            >
              <RefineGlideContext.Provider value={true}>
                {children}
              </RefineGlideContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Eases the open drawer's height when its content grows or shrinks (a chip
 * row wraps to a second line, a note appears under a select), where it would
 * otherwise snap and shove the page below.
 *
 * `measureRef` goes on a `flow-root` box around the panel, so the panel's top
 * margin is part of what is measured. `sizerRef` goes on the box around that,
 * which is pinned to the old height and animated to the new one. The pin is
 * written inside the ResizeObserver callback, which runs after layout and
 * before paint, so the new height is never painted before the glide starts.
 *
 * It glides only while the drawer rests open (`isResting`): the first
 * measure, a closed drawer and the open and close transition itself all
 * resize instantly, because the drawer's 0fr to 1fr grid owns those. A width
 * change (a resized window) snaps too. Content that eases its own height (a
 * tray opening inside the panel) is let through as it moves: gliding after
 * it would restart the glide on every frame and trail the content, clipping
 * it. The sizer clips only while it moves; at rest a Select inside must be
 * free to hang past the drawer.
 */
function usePanelHeightGlide(isOpen: boolean, isSettled: boolean) {
  const { reducedMotion } = useMotionPrefs();
  const sizerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const shouldGlideRef = useRef(false);
  const releaseRef = useRef(() => {});
  const freezeRef = useRef(() => {});
  const isResting = isOpen && isSettled;

  // A layout effect, so the sizer is settled before the first frame of the
  // close (or open) is painted.
  useLayoutEffect(() => {
    shouldGlideRef.current = isResting && !reducedMotion;
    if (shouldGlideRef.current) return;
    // Starting to close mid-glide stops the sizer where it stands, so the
    // drawer's grid closes from the height on screen. Handing the height
    // back to the content here would paint the glide's full target for a
    // frame first. The pin is let go when the drawer next opens, and
    // motion being switched off lets it go at once.
    if (isOpen || reducedMotion) releaseRef.current();
    else freezeRef.current();
  }, [isOpen, isResting, reducedMotion]);

  useEffect(() => {
    const sizer = sizerRef.current;
    const measured = measureRef.current;
    if (!sizer || !measured) return;
    let glide: ReturnType<typeof animate> | null = null;
    let lastSize: { width: number; height: number } | null = null;
    let lastResizeAt = -Infinity;

    const release = () => {
      glide?.stop();
      glide = null;
      sizer.style.height = "";
      sizer.style.overflow = "";
    };
    releaseRef.current = release;
    freezeRef.current = () => {
      glide?.stop();
      glide = null;
    };

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const resizedAt = performance.now();
      const isRapidResize = resizedAt - lastResizeAt < SELF_ANIMATING_GAP_MS;
      lastResizeAt = resizedAt;
      const previous = lastSize;
      lastSize = { width, height };
      if (!previous || height === previous.height) return;
      const isSelfAnimating = isRapidResize || isAnimatingOwnHeight(measured);
      if (
        !shouldGlideRef.current ||
        width !== previous.width ||
        isSelfAnimating
      ) {
        release();
        return;
      }
      // A glide already running starts the next one from where it is now.
      const startHeight = glide
        ? sizer.getBoundingClientRect().height
        : previous.height;
      glide?.stop();
      sizer.style.height = `${startHeight}px`;
      sizer.style.overflow = "hidden";
      const current = animate(
        sizer,
        { height: [startHeight, height] },
        { duration: PANEL_GLIDE_SECONDS, ease: PANEL_GLIDE_EASE },
      );
      glide = current;
      void current.then(() => {
        if (glide === current) release();
      });
    });
    observer.observe(measured);
    return () => {
      observer.disconnect();
      release();
      releaseRef.current = () => {};
      freezeRef.current = () => {};
    };
  }, []);

  return { sizerRef, measureRef };
}

/**
 * One named band inside the panel: an uppercase label over its controls.
 *
 * ARIA wiring is left to the caller, because only the caller knows whether the
 * band is a semantic grouping. Pass `labelId` plus `role="group"` +
 * `aria-labelledby` when it is, or point a `Select`'s `labelledBy` at it; a
 * band that is only a visual heading needs neither.
 */
export function RefineGroup({
  label,
  labelId,
  children,
  ...rest
}: {
  label: string;
  /** Id put on the label element, so a control inside can be named by it. */
  labelId?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">) {
  const generatedId = useId();

  return (
    <div className={styles.group} {...rest}>
      <span className={styles.groupLabel} id={labelId ?? generatedId}>
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * Two short groups side by side inside one band, stacking on narrow screens.
 * The first column is capped so a select can't stretch across the whole row.
 */
export function RefineSplit({ children }: { children: ReactNode }) {
  return <div className={styles.split}>{children}</div>;
}

/** A quiet line under a control, explaining what it is currently doing. */
export function RefineNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}
