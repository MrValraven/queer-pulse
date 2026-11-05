import type { JSX, ReactNode } from "react";
import type { VjEffects } from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import { vjLayerFilter, vjLayerTransform } from "../live/vjEffectsStyle";
import styles from "./VjStage.module.css";

interface VjEffectsFrameProps {
  effects: Pick<VjEffects, "isMonochrome" | "isMirrored" | "isHueCycling">;
  children: ReactNode;
  className?: string;
}

/**
 * The look applied over the clips: hue cycle on the outer wrapper (a 24 s
 * hue-rotate loop), monochrome and mirror on the inner one. Shared by the
 * projector and the remote's live mirror.
 */
export function VjEffectsFrame({
  effects,
  children,
  className,
}: VjEffectsFrameProps): JSX.Element {
  return (
    <div
      className={cx(
        styles.effectsFrame,
        effects.isHueCycling && styles.hueCycling,
        className,
      )}
      data-vj-effects-frame=""
      data-vj-hue-cycling={effects.isHueCycling ? "true" : undefined}
    >
      <div
        className={styles.effectsInner}
        style={{
          filter: vjLayerFilter(effects),
          transform: vjLayerTransform(effects),
        }}
        data-vj-monochrome={effects.isMonochrome ? "true" : undefined}
        data-vj-mirrored={effects.isMirrored ? "true" : undefined}
      >
        {children}
      </div>
    </div>
  );
}
