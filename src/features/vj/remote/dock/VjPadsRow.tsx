/**
 * The dock's effect pads row (design 7, plan R15). On a phone it is one 52px
 * band that scrolls sideways (`touch-action: pan-x`, so a sideways drag
 * never scrolls the page, and a press that turns into a scroll is cancelled
 * by the press machine); in the split layout it is a 4-column grid. Strobe
 * comes first, then one pad per dock id in order, then All effects. Pads
 * enter, leave and reorder with a short fade, scale and glide.
 */
import { AnimatePresence, m } from "motion/react";
import type { ReactNode, Ref } from "react";
import { FiGrid } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  vjEffectSettingOf,
  type VjEffectId,
  type VjEffects,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjPadId } from "../rules/vjDockPads";
import { VjEffectPad, type VjPadSendHandler } from "./VjEffectPad";
import type { VjPadSettingSend } from "./VjPadTuner";
import { VjStrobePad } from "./VjStrobePad";
import { useVjShortLabel, VJ_ALL_EFFECTS_SHORT_KEY } from "./vjPadLabel";
import styles from "./VjPads.module.css";

/** The app's base duration (--dur-base) and ease (--ease). */
const VJ_PAD_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1] as const,
};
const VJ_PAD_INSTANT = { duration: 0 };

export interface VjPadsRowProps {
  pads: readonly VjEffectId[];
  effects: VjEffects;
  isOnOf: (padId: VjPadId, serverIsOn: boolean) => boolean;
  isPendingOf: (padId: VjPadId) => boolean;
  isBlocked: boolean;
  layout: "phone" | "split";
  stateRevision: number | null;
  onPadSend: VjPadSendHandler;
  setEffectSetting: VjPadSettingSend;
  onOpenLibrary: () => void;
  /** Synced server epoch ms (`clock.serverNow`) for the strobe countdown; Date.now when left out. */
  serverNow?: () => number;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
}

/** One pad's motion wrapper: the button inside keeps its pointer capture.
 *  It takes the ref AnimatePresence's pop layout measures a leaving pad by. */
function VjPadSlot({
  isReducedMotion,
  children,
  ref,
}: {
  isReducedMotion: boolean;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  const transition = isReducedMotion ? VJ_PAD_INSTANT : VJ_PAD_TRANSITION;
  return (
    <m.div
      ref={ref}
      layout="position"
      className={styles.slot}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={transition}
    >
      {children}
    </m.div>
  );
}

function VjAllEffectsPad({ onOpenLibrary }: { onOpenLibrary: () => void }) {
  const { t } = useTranslation();
  const label = t("vj:pads.allEffects");
  // The face has room for one short word under the icon; the full name stays the button's name.
  const shortLabel = useVjShortLabel(VJ_ALL_EFFECTS_SHORT_KEY, label);
  return (
    <button
      type="button"
      className={styles.allPad}
      data-vj-pad-all=""
      aria-haspopup="dialog"
      aria-label={label}
      onClick={onOpenLibrary}
    >
      <FiGrid aria-hidden fill="none" className={styles.allIcon} />
      <span className={styles.allName} aria-hidden>
        {shortLabel}
      </span>
    </button>
  );
}

export function VjPadsRow({
  pads,
  effects,
  isOnOf,
  isPendingOf,
  isBlocked,
  layout,
  stateRevision,
  onPadSend,
  setEffectSetting,
  onOpenLibrary,
  serverNow = Date.now,
  blockedReasonId,
}: VjPadsRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const blockedDescription = isBlocked ? blockedReasonId : undefined;
  return (
    <m.div
      layoutScroll
      role="group"
      aria-label={t("vj:pads.label")}
      className={styles.row}
      data-vj-pads-row=""
      data-layout={layout}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <VjPadSlot key="strobe" isReducedMotion={reducedMotion}>
          <VjStrobePad
            effects={effects}
            isOn={isOnOf("strobe", effects.isStrobing)}
            isPending={isPendingOf("strobe")}
            isBlocked={isBlocked}
            onPadSend={onPadSend}
            serverNow={serverNow}
            describedBy={blockedDescription}
          />
        </VjPadSlot>
        {pads.map((effectId) => {
          const setting = vjEffectSettingOf(effects, effectId);
          return (
            <VjPadSlot key={effectId} isReducedMotion={reducedMotion}>
              <VjEffectPad
                effectId={effectId}
                setting={setting}
                isOn={isOnOf(effectId, setting.isOn)}
                isPending={isPendingOf(effectId)}
                isBlocked={isBlocked}
                stateRevision={stateRevision}
                onPadSend={onPadSend}
                setEffectSetting={setEffectSetting}
                describedBy={blockedDescription}
              />
            </VjPadSlot>
          );
        })}
        <VjPadSlot key="allEffects" isReducedMotion={reducedMotion}>
          <VjAllEffectsPad onOpenLibrary={onOpenLibrary} />
        </VjPadSlot>
      </AnimatePresence>
    </m.div>
  );
}
