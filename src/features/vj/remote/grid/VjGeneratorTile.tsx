import { useId, useRef, useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  VJ_GENERATOR_CATALOG,
  type VjGeneratorId,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjHelpDescribedBy } from "../top/useVjHelpDescribedBy";
import { useVjLongPress } from "../hooks/useVjLongPress";
import { VjDockPopover } from "../kit/VjDockPopover";
import { useVjMidiLearn } from "../midi/VjMidiLearnContext";
import { VJ_GRID_ITEM_ATTRIBUTE } from "./useVjGridFocus";
import styles from "./VjGrid.module.css";

/** The shared Collapse curve and its fast length, for the Live tag and the pending ring. */
const VJ_TAG_EASE = [0.22, 0.68, 0.16, 1] as const;
const VJ_TAG_MOTION_SECONDS = 0.2;

interface VjGeneratorVariantChipsProps {
  generatorId: VjGeneratorId;
  liveVariant: string | null;
  isBlocked: boolean;
  titleId: string;
  onPick: (variant: string) => void;
}

/** The flag chips of a generator with variants, one per catalog variant. */
function VjGeneratorVariantChips({
  generatorId,
  liveVariant,
  isBlocked,
  titleId,
  onPick,
}: VjGeneratorVariantChipsProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className={styles.variantPanel} data-vj-generator-variants="">
      <p id={titleId} className={styles.variantTitle}>
        {t(`vj:generator.name.${generatorId}`)}
      </p>
      <div className={styles.variantChips}>
        {VJ_GENERATOR_CATALOG[generatorId].variants.map((variant) => (
          <button
            key={variant}
            type="button"
            className={styles.variantChip}
            aria-pressed={liveVariant === variant}
            aria-disabled={isBlocked}
            data-vj-generator-variant={variant}
            onClick={() => {
              if (!isBlocked) onPick(variant);
            }}
          >
            {t(`vj:effect.variant.${variant}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface VjGeneratorTileProps {
  generatorId: VjGeneratorId;
  isLive: boolean;
  /** Set while its send waits for the ack: the pending ring, as on a clip tile. */
  isPending?: boolean;
  /** The variant on screen when this generator is live. */
  liveVariant: string | null;
  isBlocked: boolean;
  blockedReasonId?: string;
  tabIndex: 0 | -1;
  onGoGenerator: (generatorId: VjGeneratorId, variant: string | null) => void;
}

/**
 * One generator in the grid: a swatch that hints at what the screens draw,
 * its name and the Live tag. A tap sends the catalog's default variant; a
 * long press on a generator with variants (the pride flag wave) opens its
 * flag chips over the tile. While MIDI learn runs, a press sends nothing.
 */
export function VjGeneratorTile({
  generatorId,
  isLive,
  isPending = false,
  liveVariant,
  isBlocked,
  blockedReasonId,
  tabIndex,
  onGoGenerator,
}: VjGeneratorTileProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { state: learnState } = useVjMidiLearn();
  const isLearning = learnState.kind !== "idle";
  const mainRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const catalogEntry = VJ_GENERATOR_CATALOG[generatorId];
  const hasVariants = catalogEntry.variants.length > 0;
  const { handlers, consumeClick } = useVjLongPress({
    isEnabled: hasVariants && !isLearning,
    onLongPressStart: () => setIsVariantsOpen(true),
    onLongPressEnd: () => undefined,
  });
  const name = t(`vj:generator.name.${generatorId}`);
  const helpDescribedBy = useVjHelpDescribedBy();

  return (
    <div
      className={styles.tile}
      data-vj-tile=""
      data-vj-generator-tile={generatorId}
      data-live={isLive ? "true" : "false"}
      data-armed="false"
      data-pending={isPending ? "true" : "false"}
    >
      <button
        ref={mainRef}
        type="button"
        className={styles.tileMain}
        {...{ [VJ_GRID_ITEM_ATTRIBUTE]: "" }}
        tabIndex={tabIndex}
        aria-label={t("vj:grid.generatorAria", { name })}
        aria-describedby={helpDescribedBy(
          "generatorTile",
          isBlocked ? blockedReasonId : undefined,
        )}
        aria-current={isLive ? "true" : undefined}
        aria-disabled={isBlocked}
        {...handlers}
        onContextMenu={(event) => event.preventDefault()}
        onClick={() => {
          if (consumeClick() || isBlocked || isLearning) return;
          onGoGenerator(generatorId, catalogEntry.defaultVariant);
        }}
      >
        <span
          className={styles.swatch}
          data-generator={generatorId}
          aria-hidden="true"
        />
        <span className={styles.tileShade}>
          <span className={styles.tileTitle}>{name}</span>
        </span>
        <span className={styles.tileTags}>
          <AnimatePresence initial={false}>
            {isLive ? (
              <m.span
                key="live"
                className={styles.liveTag}
                data-vj-live-tag=""
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{
                  duration: reducedMotion ? 0 : VJ_TAG_MOTION_SECONDS,
                  ease: VJ_TAG_EASE,
                }}
              >
                {t("vj:remote.clipLive")}
              </m.span>
            ) : null}
          </AnimatePresence>
        </span>
        <AnimatePresence initial={false}>
          {isPending ? (
            <m.span
              key="pending-ring"
              className={styles.pendingRing}
              data-vj-pending-ring=""
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{
                duration: reducedMotion ? 0 : VJ_TAG_MOTION_SECONDS,
                ease: VJ_TAG_EASE,
              }}
            />
          ) : null}
        </AnimatePresence>
      </button>
      {hasVariants ? (
        <VjDockPopover
          anchorRef={mainRef}
          isOpen={isVariantsOpen}
          onClose={() => setIsVariantsOpen(false)}
          labelledBy={titleId}
        >
          <VjGeneratorVariantChips
            generatorId={generatorId}
            liveVariant={isLive ? liveVariant : null}
            isBlocked={isBlocked}
            titleId={titleId}
            onPick={(variant) => {
              onGoGenerator(generatorId, variant);
              setIsVariantsOpen(false);
            }}
          />
        </VjDockPopover>
      ) : null}
    </div>
  );
}
