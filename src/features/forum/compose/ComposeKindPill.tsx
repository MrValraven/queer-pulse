import { useState } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { COMPOSE_KINDS } from "./composeKinds.data";
import type { PostKind } from "./composeThread.types";
import { COMPOSE_EASE } from "./composeMotion";
import type { KindChipLayout } from "./useKindChipLayout";
import styles from "./ComposeKindChips.module.css";

// ── The plum pill under the chosen kind chip ────────────────────────────────
// One plum layer over the whole chip row, holding a cream copy of every chip
// label at the exact spot of the real one, and clipped to the chosen chip's
// box. Moving the clip moves the pill: wherever it is mid-slide, the labels
// inside it are cream on plum and the labels outside it are the real, dark
// ones on cream, so every label reads in every frame. The copy is hidden from
// assistive tech, which reads each real chip once.

/** The chip radius, large enough that the clip rounds into a full pill. */
const PILL_RADIUS = 999;

interface ComposeKindPillProps {
  /** The chip the pill sits on (it stays there, faded out, when cleared). */
  indicatorKind: PostKind;
  isShown: boolean;
  layout: KindChipLayout;
}

function clipFor(layout: KindChipLayout, kind: PostKind) {
  const box = layout.chips[kind];
  if (!box) return `inset(0px 0px 0px 0px round ${PILL_RADIUS}px)`;
  const right = layout.rowWidth - box.left - box.width;
  const bottom = layout.rowHeight - box.top - box.height;
  return `inset(${box.top}px ${right}px ${bottom}px ${box.left}px round ${PILL_RADIUS}px)`;
}

export function ComposeKindPill({
  indicatorKind,
  isShown,
  layout,
}: ComposeKindPillProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // The chip the pill last came to rest on. While it differs from the target
  // the clip glides; once it matches, a reflow (a wrap, a resize) moves the
  // clip at once so the pill never trails its chip.
  const [settledKind, setSettledKind] = useState(indicatorKind);
  const isGliding = settledKind !== indicatorKind;
  const duration = reducedMotion ? 0 : 0.25;

  return (
    <m.div
      className={styles.pill}
      initial={false}
      animate={{
        clipPath: clipFor(layout, indicatorKind),
        opacity: isShown ? 1 : 0,
      }}
      // `--dur-base` and `--ease`, the chips' own hover timing.
      transition={{
        clipPath: { duration: isGliding ? duration : 0, ease: COMPOSE_EASE },
        opacity: { duration, ease: COMPOSE_EASE },
      }}
      onAnimationComplete={() => setSettledKind(indicatorKind)}
      aria-hidden
    >
      {COMPOSE_KINDS.map((option) => {
        const box = layout.chips[option.id];
        if (!box) return null;
        const Icon = option.icon;
        return (
          <span key={option.id} className={styles.pillChip} style={box}>
            <span className={styles.kindFace}>
              <Icon className={styles.kindIcon} />
              {t(option.nameKey)}
            </span>
          </span>
        );
      })}
    </m.div>
  );
}
