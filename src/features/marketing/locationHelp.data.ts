/** Which browser's menus the steps name. `ios` and `android` cover every
 *  browser on those systems, since the device decides more than the app. */
export type LocationHelpBrowser =
  "chromium" | "safari" | "firefox" | "ios" | "android" | "other";

/** Which device-wide location switch the "Still off?" line points at. */
export type LocationHelpSystem =
  "mac" | "windows" | "ios" | "android" | "other";

/** Per-browser "turn location back on" steps for `LocationHelpModal`. */
export const LOCATION_HELP_BROWSER_STEPS: Record<
  LocationHelpBrowser,
  { titleKey: string; stepKeys: string[] }
> = {
  chromium: {
    titleKey: "marketing:local.nearMe.help.chromium.title",
    stepKeys: [
      "marketing:local.nearMe.help.chromium.step1",
      "marketing:local.nearMe.help.chromium.step2",
      "marketing:local.nearMe.help.chromium.step3",
    ],
  },
  safari: {
    titleKey: "marketing:local.nearMe.help.safari.title",
    stepKeys: [
      "marketing:local.nearMe.help.safari.step1",
      "marketing:local.nearMe.help.safari.step2",
      "marketing:local.nearMe.help.safari.step3",
    ],
  },
  firefox: {
    titleKey: "marketing:local.nearMe.help.firefox.title",
    stepKeys: [
      "marketing:local.nearMe.help.firefox.step1",
      "marketing:local.nearMe.help.firefox.step2",
      "marketing:local.nearMe.help.firefox.step3",
    ],
  },
  ios: {
    titleKey: "marketing:local.nearMe.help.ios.title",
    stepKeys: [
      "marketing:local.nearMe.help.ios.step1",
      "marketing:local.nearMe.help.ios.step2",
      "marketing:local.nearMe.help.ios.step3",
    ],
  },
  android: {
    titleKey: "marketing:local.nearMe.help.android.title",
    stepKeys: [
      "marketing:local.nearMe.help.android.step1",
      "marketing:local.nearMe.help.android.step2",
      "marketing:local.nearMe.help.android.step3",
    ],
  },
  other: {
    titleKey: "marketing:local.nearMe.help.other.title",
    stepKeys: [
      "marketing:local.nearMe.help.other.step1",
      "marketing:local.nearMe.help.other.step2",
      "marketing:local.nearMe.help.other.step3",
    ],
  },
};

/** The device-wide switch that refuses location exactly like a blocked site. */
export const LOCATION_HELP_SYSTEM_KEYS: Record<LocationHelpSystem, string> = {
  mac: "marketing:local.nearMe.help.system.mac",
  windows: "marketing:local.nearMe.help.system.windows",
  ios: "marketing:local.nearMe.help.system.ios",
  android: "marketing:local.nearMe.help.system.android",
  other: "marketing:local.nearMe.help.system.other",
};
