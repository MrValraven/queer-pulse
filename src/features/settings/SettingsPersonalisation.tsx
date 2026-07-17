import { useState, type RefCallback } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useReduceMotion } from "../../app/providers/accessibilityContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Pane } from "./SettingsControls";
import { ThemeStudio } from "./ThemeStudio";
import {
  DEFAULT_PREFS,
  type A11yPrefs,
  type ColorTheme,
} from "./accessibilityPreferences.data";
import {
  A11yDisplaySection,
  A11yMotionSection,
  A11yReadingSection,
  A11yInteractionSection,
} from "./AccessibilityPrefSections";
import a11yStyles from "./AccessibilityPreferencesPage.module.css";

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

export function AccessibilityPane({ onChange }: { onChange: () => void }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Reduce motion is the one live, persisted preference; the rest are unbacked.
  const { reduceMotion, setReduceMotion } = useReduceMotion();
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);
  const merged = { ...prefs, reduceMotion };

  function toggle(key: keyof A11yPrefs) {
    if (key === "reduceMotion") {
      setReduceMotion((current) => !current);
    } else {
      setPrefs((p) => ({ ...p, [key]: !p[key] }));
    }
    onChange();
  }

  function resetAll() {
    setPrefs(DEFAULT_PREFS);
    setReduceMotion(false);
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
        prefs={merged}
        onToggle={toggle}
        onSizeChange={(v) => {
          setPrefs((p) => ({ ...p, textSize: v }));
          onChange();
        }}
        sectionRef={noRef}
      />
      <A11yMotionSection prefs={merged} onToggle={toggle} sectionRef={noRef} />
      <A11yReadingSection
        prefs={merged}
        onToggle={toggle}
        onColorTheme={(t) => {
          setPrefs((p) => ({ ...p, colorTheme: t as ColorTheme }));
          onChange();
        }}
        sectionRef={noRef}
      />
      <A11yInteractionSection
        prefs={merged}
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
