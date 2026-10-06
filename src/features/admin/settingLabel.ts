import type { TFunction } from "../../shared/i18n/types";
import { SETTING_LABEL_KEYS } from "./adminSettings.data";

/**
 * A `settingKey` the frontend doesn't recognize yet (the backend can ship a
 * new kill switch before `SETTING_LABEL_KEYS` is updated for it) falls back to
 * a humanized version of the raw camelCase name: `lockdownEnabled` becomes
 * `Lockdown Enabled`, so the machine key is never printed as-is.
 */
function fallbackLabel(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** A platform setting's human label, shared by Settings History and the platform log. */
export function settingLabel(key: string, t: TFunction): string {
  const labelKey = SETTING_LABEL_KEYS[key];
  return labelKey ? t(labelKey) : fallbackLabel(key);
}
