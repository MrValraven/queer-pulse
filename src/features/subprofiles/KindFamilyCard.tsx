import {
  type ReactNode,
  type Ref,
  type RefObject,
  useLayoutEffect,
  useRef,
} from "react";
import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  m,
  type MotionValue,
  useIsPresent,
  useMotionValue,
} from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  CHIP_EASE,
  useChipMotion,
} from "../../shared/components/ui/useChipMotion";
import type { Translation as TranslationApi } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "./api/subprofiles.api";
import {
  KIND_ICON_OVERRIDE,
  KIND_LABEL_KEYS,
  kindIcon,
} from "./subprofile-kinds";
import type { KindFamily } from "./kindFamilies.data";
import styles from "./NewSideModal.module.css";

/** Matches `Collapse`'s fold, so a card resizing and a family folding
 *  beside it move at the same pace. */
const GRID_HEIGHT_DURATION_S = 0.28;

/**
 * A height that follows `contentRef`'s element: it takes the first measured
 * height at once, then eases to every later one (a ResizeObserver drives
 * it). Bind it to a wrapper's `style.height` so the wrapper grows and shrinks
 * smoothly after content that reflows at once. It is `"auto"` until the first
 * measurement. Imperative on purpose: an `animate={{ height }}` target on a
 * card mounted inside an entering `Collapse` never wrote its first value, so
 * that card's height stayed `auto` and snapped on its next change.
 */
function useEasedHeight(
  contentRef: RefObject<HTMLElement | null>,
): MotionValue<number | string> {
  const { reducedMotion } = useMotionPrefs();
  const height = useMotionValue<number | string>("auto");
  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    let hasMeasured = false;
    let heightAnimation: AnimationPlaybackControls | undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const nextHeight =
        entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      heightAnimation?.stop();
      if (!hasMeasured || reducedMotion) {
        hasMeasured = true;
        height.set(nextHeight);
        return;
      }
      heightAnimation = animate(height, nextHeight, {
        duration: GRID_HEIGHT_DURATION_S,
        ease: CHIP_EASE,
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      heightAnimation?.stop();
    };
  }, [contentRef, height, reducedMotion]);
  return height;
}

/**
 * One family of the "By craft" picker: its header, then its kinds as a grid.
 * As the search changes, a kind joining the family pops in, a kind leaving
 * pops out (lifted out of the grid by `popLayout`), and the kinds that stay
 * glide to their new grid cells. The grid itself reflows at once, and a
 * wrapper eases the card's height after it (`useEasedHeight`), so a card
 * gaining or losing a row of kinds grows or shrinks smoothly and the families
 * below slide with it. The card keeps a plain `overflow: hidden` for its
 * rounded header, which also clips a row that is still growing in; the card
 * itself never layout-animates, so its border radius never stretches.
 *
 * Every kind sits in the grid's own `AnimatePresence`, so a kind that leaves
 * registers only with that presence and never holds up the family's own
 * `Collapse` exit.
 */
export function KindFamilyCard({
  familyGroup,
  visibleKinds,
  selectedKind,
  onChangeKind,
  shouldKindsPopIn,
  t,
}: {
  familyGroup: KindFamily;
  visibleKinds: SubprofileKind[];
  selectedKind: SubprofileKind | null;
  onChangeKind: (kind: SubprofileKind) => void;
  /** False only while the picker still shows the kinds it opened with. */
  shouldKindsPopIn: boolean;
  t: TranslationApi["t"];
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridHeight = useEasedHeight(gridRef);
  // The kinds only re-measure for a glide when this family's list changes.
  const visibleKindsKey = visibleKinds.join(",");
  return (
    <div className={styles.fam}>
      <div className={styles.famHead}>
        <b>{t(familyGroup.labelKey)}</b>
        <span>{t(familyGroup.noteKey)}</span>
      </div>
      <m.div style={{ height: gridHeight }}>
        <div ref={gridRef} className={styles.kinds}>
          <AnimatePresence mode="popLayout">
            {visibleKinds.map((candidateKind) => {
              const Icon = kindIcon(candidateKind);
              // A filled `gi` glyph (the icon overrides) reads heavier than
              // the outline `fi` icons beside it at the same nominal size,
              // so it gets trimmed 1px to balance optically.
              const isFilledIcon = Boolean(KIND_ICON_OVERRIDE[candidateKind]);
              return (
                <KindButton
                  key={candidateKind}
                  isSelected={selectedKind === candidateKind}
                  onSelect={() => onChangeKind(candidateKind)}
                  shouldPopIn={shouldKindsPopIn}
                  layoutDependency={visibleKindsKey}
                  icon={
                    <Icon
                      size={16}
                      aria-hidden
                      className={
                        isFilledIcon ? styles.kindIconFilled : undefined
                      }
                    />
                  }
                  label={t(KIND_LABEL_KEYS[candidateKind])}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </m.div>
    </div>
  );
}

/**
 * One kind of the grid. It pops in and out with the shared chip motion and
 * glides to its new cell (`layout="position"`, so it never scales and its
 * corners never stretch). Its `initial` is `false` only for the kinds the
 * picker opens with: in development, StrictMode replays a moved button's
 * entrance, and a button with no starting state would stay stuck halfway
 * through its fade. On its way out it is hidden from assistive tech, leaves
 * the tab order and ignores the pointer (`data-leaving` in the CSS). `inert`
 * is avoided on purpose: inside the modal it breaks the focus trap. A
 * leaving button renders with its last props, so it keeps its look while it
 * fades.
 */
function KindButton({
  isSelected,
  onSelect,
  shouldPopIn,
  layoutDependency,
  icon,
  label,
  ref,
}: {
  isSelected: boolean;
  onSelect: () => void;
  shouldPopIn: boolean;
  layoutDependency: string;
  icon: ReactNode;
  label: string;
  /** The one `AnimatePresence` uses to measure the button before lifting it
   *  out of the grid (`popLayout`). */
  ref?: Ref<HTMLButtonElement>;
}) {
  const isPresent = useIsPresent();
  const { chip, transition } = useChipMotion();
  return (
    <m.button
      ref={ref}
      type="button"
      aria-pressed={isSelected}
      aria-hidden={isPresent ? undefined : true}
      tabIndex={isPresent ? undefined : -1}
      data-leaving={isPresent ? undefined : ""}
      className={[styles.kindBtn, isSelected && styles.kindBtnOn]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelect}
      layout={chip.layout}
      layoutDependency={layoutDependency}
      initial={shouldPopIn ? chip.initial : false}
      animate={chip.animate}
      exit={chip.exit}
      transition={transition}
    >
      {icon}
      {label}
    </m.button>
  );
}
