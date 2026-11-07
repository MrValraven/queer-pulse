import {
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
  type RefObject,
} from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type {
  VjColorToken,
  VjEffects,
  VjTempo,
} from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import type { VjFlashBudget } from "../engine/safety/vjFlashGovernor";
import type { VjClockReader } from "../engine/vjEngineLook";
import { useVjDomBeat } from "./useVjDomBeat";
import styles from "./VjDomEffects.module.css";
import {
  vjDomDuotoneOf,
  vjDomFilter,
  vjDomLayersOf,
  vjDomMaskClipPath,
  vjDomSettingOf,
  vjDomTintColour,
  vjDomTransform,
  type VjDomDuotone,
} from "./vjDomEffectsStyle";

interface VjEffectsFrameProps {
  effects: Pick<VjEffects, "settings" | "isStrobing">;
  tempo?: VjTempo | null;
  clock?: VjClockReader | null;
  children: ReactNode;
  className?: string;
  /** The screen's shared flash budget, when the renderer holds one. */
  flashBudgetRef?: RefObject<VjFlashBudget>;
}

/**
 * The colour layers over the picture, matched to the WebGL shaders. Tint is
 * `luma * colour`: a colour-blend layer takes the tint's hue at the
 * picture's lightness, then a multiply layer of the tint's own grey (its
 * luma) darkens it the way the shader does. Duotone maps the grey picture
 * (vjDomFilter adds the grayscale) from shadow to highlight: a multiply by
 * the highlight, then a screen of the shadow, which lifts black to the
 * shadow colour and keeps white near the highlight.
 */
function VjDomColourLayers({
  tint,
  tintAmount,
  duotone,
}: {
  tint: VjColorToken | null;
  tintAmount: number;
  duotone: VjDomDuotone | null;
}): JSX.Element {
  const tintStyle = {
    "--vj-dom-tint": tint === null ? undefined : vjDomTintColour(tint),
    opacity: tintAmount,
  } as CSSProperties;
  return (
    <>
      {tint !== null ? (
        <>
          <div
            className={cx(styles.layer, styles.tint)}
            style={tintStyle}
            data-vj-tint={tint}
          />
          <div
            className={cx(styles.layer, styles.tintShade)}
            style={tintStyle}
            data-vj-tint-shade=""
          />
        </>
      ) : null}
      {duotone !== null ? (
        <>
          <div
            className={cx(styles.layer, styles.duotoneHighlight)}
            style={
              {
                "--vj-dom-duotone": vjDomTintColour(duotone.highlight),
                opacity: duotone.amount,
              } as CSSProperties
            }
            data-vj-duotone-highlight={duotone.highlight}
          />
          <div
            className={cx(styles.layer, styles.duotoneShadow)}
            style={
              {
                "--vj-dom-duotone": vjDomTintColour(duotone.shadow),
                opacity: duotone.amount,
              } as CSSProperties
            }
            data-vj-duotone-shadow={duotone.shadow}
          />
        </>
      ) : null}
    </>
  );
}

/**
 * The catalog look over the clips on the DOM path (contract 3.2, DOM
 * column): filters and transforms on the picture, a reflected half for the
 * mirror, then the tint, duotone, scanlines and vignette layers, all clipped by the
 * mask. Beat-driven values come from useVjDomBeat on the synced clock; with
 * no clock they rest and everything else still draws. Shared by the
 * projector's DOM renderer and the remote's mirror, so it sizes to whatever
 * box holds it.
 */
export function VjEffectsFrame({
  effects,
  tempo = null,
  clock = null,
  children,
  className,
  flashBudgetRef,
}: VjEffectsFrameProps): JSX.Element {
  const frameRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPrefs();
  const settings = effects.settings;

  // Once invert has been on, its filter term stays, so a governed switch-off
  // can ramp down through --vj-dom-invert.
  const isInvertOn = vjDomSettingOf(settings, "invert") !== null;
  const [hasShownInvert, setHasShownInvert] = useState(isInvertOn);
  if (isInvertOn && !hasShownInvert) setHasShownInvert(true);

  useVjDomBeat(frameRef, {
    settings,
    tempo,
    clock,
    isStrobing: effects.isStrobing,
    isReducedMotion: reducedMotion,
    flashBudgetRef,
  });

  const layers = vjDomLayersOf(settings);
  const lookStyle: CSSProperties = {
    filter: vjDomFilter(settings, { shouldHoldInvert: hasShownInvert }),
    transform: vjDomTransform(settings),
  };
  const canvasStyle: CSSProperties | undefined =
    layers.mask === null
      ? undefined
      : { clipPath: vjDomMaskClipPath(layers.mask) };

  return (
    <div
      ref={frameRef}
      className={cx(styles.frame, className)}
      data-vj-effects-frame=""
    >
      <div
        className={styles.canvas}
        style={canvasStyle}
        data-vj-mask={layers.mask?.shape}
      >
        <div className={styles.look} style={lookStyle} data-vj-effects-look="">
          <div
            className={styles.mirror}
            data-vj-mirror={layers.mirror ?? undefined}
          >
            <div className={styles.content}>{children}</div>
          </div>
        </div>
        <VjDomColourLayers
          tint={layers.tint}
          tintAmount={layers.tintAmount}
          duotone={vjDomDuotoneOf(settings)}
        />
        {layers.scanlines > 0 ? (
          <div
            className={cx(styles.layer, styles.scanlines)}
            style={{ opacity: layers.scanlines }}
            data-vj-scanlines=""
          />
        ) : null}
        {layers.vignette > 0 ? (
          <div
            className={cx(styles.layer, styles.vignette)}
            style={{ opacity: layers.vignette }}
            data-vj-vignette=""
          />
        ) : null}
      </div>
    </div>
  );
}
