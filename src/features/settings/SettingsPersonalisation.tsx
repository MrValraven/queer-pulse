import { type RefCallback } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useReduceMotion } from "../../app/providers/accessibilityContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Pane } from "./SettingsControls";
import { ThemeStudio } from "./ThemeStudio";
import { DEFAULT_PREFS, type A11yPrefs } from "./accessibilityPreferences.data";
import {
  A11yDisplaySection,
  A11yMotionSection,
  A11yReadingSection,
  A11yInteractionSection,
} from "./AccessibilityPrefSections";
import { setSkipLinkPref, useSkipLinkPref } from "./skipLinkPref";
import a11yStyles from "./AccessibilityPrefSections.module.css";

const noRef: RefCallback<HTMLElement> = () => {};

export function ProfileThemePane({ onChange }: { onChange: () => void }) {
  const { t } = useTranslation();
  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:personalisation.theme.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:personalisation.theme.sub")}
    >
      <ThemeStudio onChange={onChange} />
    </Pane>
  );
}

/**
 * Accessibility preferences.
 *
 * Only two of these are real: "Reduce motion" (AccessibilityProvider, reflected
 * onto <html data-reduce-motion>) and "Skip to content link" (skipLinkPref).
 * Both persist the instant they are flipped, so the pane never joins the save
 * bar's dirty flow and never reports a save it did not make. Everything else is
 * badged `comingSoon` and inert until there is a store and a stylesheet behind
 * it: a toggle that moves and changes nothing is worse than one that says so.
 */
export function AccessibilityPane() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reduceMotion, setReduceMotion } = useReduceMotion();
  const isSkipLinkOn = useSkipLinkPref();
  const prefs: A11yPrefs = {
    ...DEFAULT_PREFS,
    reduceMotion,
    skipLink: isSkipLinkOn,
  };

  function toggle(key: keyof A11yPrefs) {
    if (key === "reduceMotion") {
      setReduceMotion((current) => !current);
    } else if (key === "skipLink") {
      setSkipLinkPref((current) => !current);
    }
    // Every other key is inert (comingSoon): nothing to move, nothing to save.
  }

  function resetAll() {
    setSkipLinkPref(DEFAULT_PREFS.skipLink);
    setReduceMotion(DEFAULT_PREFS.reduceMotion);
    showToast(t("settings:personalisation.accessibility.resetToast"), "info");
  }

  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:personalisation.accessibility.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:personalisation.accessibility.sub")}
    >
      <A11yDisplaySection prefs={prefs} onToggle={toggle} sectionRef={noRef} />
      <A11yMotionSection prefs={prefs} onToggle={toggle} sectionRef={noRef} />
      <A11yReadingSection prefs={prefs} onToggle={toggle} sectionRef={noRef} />
      <A11yInteractionSection
        prefs={prefs}
        onToggle={toggle}
        sectionRef={noRef}
      />

      <div className={a11yStyles.section}>
        <div className={a11yStyles.resetCard}>
          <Button
            variant="ghost"
            onClick={resetAll}
            style={{ margin: "0 auto" }}
          >
            {t("settings:personalisation.accessibility.resetAll")}
          </Button>
          <div className={a11yStyles.resetNote}>
            {t("settings:personalisation.accessibility.resetNote")}
          </div>
          <div className={a11yStyles.deviceNote}>
            {t("settings:personalisation.accessibility.deviceNote")}
          </div>
        </div>
      </div>
    </Pane>
  );
}
