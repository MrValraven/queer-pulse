import type { CSSProperties, JSX } from "react";
import {
  VJ_GENERATOR_CATALOG,
  VJ_PRIDE_FLAGS,
  type VjGeneratorId,
  type VjPrideFlag,
} from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import { VJ_FLAG_TOKEN_COUNTS, vjFlagStripeToken } from "../engine/vjPalette";
import styles from "./VjStage.module.css";

/** The flag a prideFlagWave draws when its variant names no flag (the catalog default). */
const DEFAULT_FLAG: VjPrideFlag = "rainbow";

function isVjPrideFlag(value: string | null): value is VjPrideFlag {
  return VJ_PRIDE_FLAGS.some((flag) => flag === value);
}

/** What the DOM draws: the generator itself when the catalog says it can, else gradientField (contract 3.3). */
function domGeneratorOf(generatorId: VjGeneratorId): VjGeneratorId {
  return VJ_GENERATOR_CATALOG[generatorId].isDomCapable
    ? generatorId
    : "gradientField";
}

function percentOf(fraction: number): string {
  return `${Number((fraction * 100).toFixed(4))}%`;
}

/** Hard-edged horizontal stripes, top to bottom, from the flag's stripe tokens. */
function flagStripesBackground(flag: VjPrideFlag): string {
  const stripeCount = VJ_FLAG_TOKEN_COUNTS[flag];
  const stops = Array.from({ length: stripeCount }, (_unused, stripeIndex) => {
    const colour = `rgb(var(${vjFlagStripeToken(flag, stripeIndex)}))`;
    const start = percentOf(stripeIndex / stripeCount);
    const end = percentOf((stripeIndex + 1) / stripeCount);
    return `${colour} ${start} ${end}`;
  });
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/**
 * A generator on the DOM fallback (contract 3.3): `gradientField` is a
 * slowly drifting gradient of palette tokens, `prideFlagWave` its flag's
 * stripes held still, and plasma, starfield and tunnel draw as
 * `gradientField`. Colours come only from the `--vj-palette-*` and
 * `--vj-flag-*` tokens.
 */
export function VjDomGenerator({
  generatorId,
  generatorVariant,
}: {
  generatorId: VjGeneratorId;
  generatorVariant: string | null;
}): JSX.Element {
  const drawnId = domGeneratorOf(generatorId);
  if (drawnId === "prideFlagWave") {
    const flag = isVjPrideFlag(generatorVariant)
      ? generatorVariant
      : DEFAULT_FLAG;
    const style = {
      "--vj-flag-stripes": flagStripesBackground(flag),
    } as CSSProperties;
    return (
      <div
        className={cx(styles.generator, styles.generatorStripes)}
        style={style}
        data-vj-generator={drawnId}
        data-vj-generator-source={generatorId}
        data-vj-flag={flag}
        aria-hidden="true"
      />
    );
  }
  return (
    <div
      className={cx(styles.generator, styles.generatorGradient)}
      data-vj-generator="gradientField"
      data-vj-generator-source={generatorId}
      aria-hidden="true"
    />
  );
}
