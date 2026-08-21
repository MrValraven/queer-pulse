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
