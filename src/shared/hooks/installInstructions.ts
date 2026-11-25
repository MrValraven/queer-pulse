import type { InstallPlatform } from "./useInstallPrompt";

/** Per-platform "how to install" copy, shared by PwaPromptPage and InstallAppModal. */
export const INSTALL_INSTRUCTIONS: Record<
  InstallPlatform,
  { titleKey: string; stepKeys: string[] }
> = {
  ios: {
    titleKey: "system:pwaPrompt.instructions.ios.title",
    stepKeys: [
      "system:pwaPrompt.instructions.ios.step1",
      "system:pwaPrompt.instructions.ios.step2",
      "system:pwaPrompt.instructions.ios.step3",
    ],
  },
  android: {
    titleKey: "system:pwaPrompt.instructions.android.title",
    stepKeys: [
      "system:pwaPrompt.instructions.android.step1",
      "system:pwaPrompt.instructions.android.step2",
      "system:pwaPrompt.instructions.android.step3",
    ],
  },
  desktop: {
    titleKey: "system:pwaPrompt.instructions.desktop.title",
    stepKeys: [
      "system:pwaPrompt.instructions.desktop.step1",
      "system:pwaPrompt.instructions.desktop.step2",
      "system:pwaPrompt.instructions.desktop.step3",
    ],
  },
};

export const INSTALL_TAB_LABEL_KEY: Record<InstallPlatform, string> = {
  ios: "system:pwaPrompt.tabs.ios",
  android: "system:pwaPrompt.tabs.android",
  desktop: "system:pwaPrompt.tabs.desktop",
};

/**
 * The extra first step shown inside a social app's built-in browser (see
 * `detectInAppBrowser`): move the page into the phone's own browser, where the
 * install steps below it can work. Desktop has no such step.
 */
export const IN_APP_BROWSER_STEP_KEY: Partial<Record<InstallPlatform, string>> =
  {
    ios: "system:pwaPrompt.instructions.inApp.iosStep",
    android: "system:pwaPrompt.instructions.inApp.androidStep",
  };

/**
 * The steps to render for `platform`, with the open-in-browser step first when
 * the page is running inside a social app's built-in browser.
 */
export function getInstallStepKeys(
  platform: InstallPlatform,
  isInAppBrowser: boolean,
): string[] {
  const { stepKeys } = INSTALL_INSTRUCTIONS[platform];
  const inAppStepKey = IN_APP_BROWSER_STEP_KEY[platform];
  if (!isInAppBrowser || !inAppStepKey) return stepKeys;
  return [inAppStepKey, ...stepKeys];
}

/**
 * A Safari screenshot shown under an install step. The files live in
 * `public/install-steps/` as `<baseName>-en.webp` and `<baseName>-pt.webp`,
 * saved at 2x, so `width` and `height` are the CSS size (half the pixels).
 */
export interface InstallStepScreenshot {
  baseName: string;
  width: number;
  height: number;
  altKey: string;
}

/**
 * The screenshot for each step that has one, keyed by step key. Only the
 * iPhone steps have pictures; Android, desktop and the in-app browser step
 * look up nothing and render text alone.
 */
export const INSTALL_STEP_IMAGES: Partial<
  Record<string, InstallStepScreenshot>
> = {
  "system:pwaPrompt.instructions.ios.step1": {
    baseName: "ios-step1",
    width: 207,
    height: 184,
    altKey: "system:pwaPrompt.instructions.ios.step1Image",
  },
  "system:pwaPrompt.instructions.ios.step2": {
    baseName: "ios-step2",
    width: 306,
    height: 200,
    altKey: "system:pwaPrompt.instructions.ios.step2Image",
  },
  "system:pwaPrompt.instructions.ios.step3": {
    baseName: "ios-step3",
    width: 332,
    height: 224,
    altKey: "system:pwaPrompt.instructions.ios.step3Image",
  },
};
