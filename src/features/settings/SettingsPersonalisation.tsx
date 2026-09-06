import { type RefCallback } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAccessibilityPrefs } from "../../app/providers/accessibilityContext";
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
 * Every row on this pane is applied. Four of the five ride on
 * `AccessibilityProvider` (reduce motion, text size, open-out spacing, always
 * show focus), which persists each to localStorage and stamps it onto <html>
 * before paint; the fifth is the skip link, whose own store (`skipLinkPref`)
 * predates the provider because `AppShell` and `PageShell` subscribe to it.
 * All of them persist the instant they are flipped, so the pane never joins
 * the save bar's dirty flow and never reports a save it did not make.
 *
 * Until PRD-307 ten of twelve rows were badged `comingSoon` and rendered
 * inert. They are gone rather than restyled: a settings page full of dead
 * toggles is worse than a shorter honest one, and this is the page a member
 * reaches precisely when they need something to work.
 */
export function AccessibilityPane() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    reduceMotion,
    setReduceMotion,
    textScale,
    setTextScale,
    wideSpacing,
    setWideSpacing,
    alwaysShowFocus,
    setAlwaysShowFocus,
  } = useAccessibilityPrefs();
  const isSkipLinkOn = useSkipLinkPref();
  const prefs: A11yPrefs = {
    reduceMotion,
    wideSpacing,
    focusRings: alwaysShowFocus,
    skipLink: isSkipLinkOn,
    textSize: textScale,
  };

  function toggle(key: keyof A11yPrefs) {
    if (key === "reduceMotion") {
      setReduceMotion((current) => !current);
    } else if (key === "skipLink") {
      setSkipLinkPref((current) => !current);
    } else if (key === "wideSpacing") {
      setWideSpacing((current) => !current);
    } else if (key === "focusRings") {
      setAlwaysShowFocus((current) => !current);
    }
  }

  function resetAll() {
    setSkipLinkPref(DEFAULT_PREFS.skipLink);
    setReduceMotion(DEFAULT_PREFS.reduceMotion);
    setTextScale(DEFAULT_PREFS.textSize);
    setWideSpacing(DEFAULT_PREFS.wideSpacing);
    setAlwaysShowFocus(DEFAULT_PREFS.focusRings);
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
      <A11yDisplaySection
        prefs={prefs}
        onToggle={toggle}
        onTextSizeChange={setTextScale}
        sectionRef={noRef}
      />
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
