import {
  isEarlyAccessFeatureKey,
  type EarlyAccessFeatureKey,
} from "../../../shared/contracts/earlyAccess";
import type { TFunction } from "../../../shared/i18n/types";

/** The catalog key naming a known early access feature. */
export function earlyAccessFeatureNameKey(
  featureKey: EarlyAccessFeatureKey,
): `admin:earlyAccess.feature.${EarlyAccessFeatureKey}.name` {
  return `admin:earlyAccess.feature.${featureKey}.name`;
}

/** The catalog key describing a known early access feature. */
export function earlyAccessFeatureDescriptionKey(
  featureKey: EarlyAccessFeatureKey,
): `admin:earlyAccess.feature.${EarlyAccessFeatureKey}.description` {
  return `admin:earlyAccess.feature.${featureKey}.description`;
}

export interface EarlyAccessFeatureLabel {
  name: string;
  description: string;
}

/**
 * A feature's name and description for a wire `featureKey`. A key this build
 * does not know yet (the server moved ahead of the frontend) shows as its raw
 * key with no description, so the row still renders and stays actionable.
 */
export function earlyAccessFeatureLabel(
  t: TFunction,
  featureKey: string,
): EarlyAccessFeatureLabel {
  if (!isEarlyAccessFeatureKey(featureKey))
    return { name: featureKey, description: "" };
  return {
    name: t(earlyAccessFeatureNameKey(featureKey)),
    description: t(earlyAccessFeatureDescriptionKey(featureKey)),
  };
}
