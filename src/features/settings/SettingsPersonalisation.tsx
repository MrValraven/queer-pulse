import { useState, type RefCallback } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
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
  return (
    <Pane
      title={
        <>
          Profile <em>theme.</em>
        </>
      }
      sub="Personalise how your profile and directory card look. Pick a pride flag, cover style, and pattern — and choose what shows up next to your name."
    >
      <ThemeStudio onChange={onChange} />
    </Pane>
  );
}

export function AccessibilityPane({ onChange }: { onChange: () => void }) {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);

  function toggle(key: keyof A11yPrefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    onChange();
  }

  function resetAll() {
    setPrefs(DEFAULT_PREFS);
    showToast("All preferences reset", "info");
  }

  return (
    <Pane
      title={
        <>
          Accessibility <em>preferences.</em>
        </>
      }
      sub="Tune display, motion, reading, and interaction to suit you. These settings apply across the whole platform."
    >
      <A11yDisplaySection
        prefs={prefs}
        onToggle={toggle}
        onSizeChange={(v) => {
          setPrefs((p) => ({ ...p, textSize: v }));
          onChange();
        }}
        sectionRef={noRef}
      />
      <A11yMotionSection prefs={prefs} onToggle={toggle} sectionRef={noRef} />
      <A11yReadingSection
        prefs={prefs}
        onToggle={toggle}
        onColorTheme={(t) => {
          setPrefs((p) => ({ ...p, colorTheme: t as ColorTheme }));
          onChange();
        }}
        sectionRef={noRef}
      />
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
            Reset all preferences
          </Button>
          <div className={a11yStyles.resetNote}>
            This returns all display settings to their defaults. Your profile
            data is unaffected.
          </div>
          <div className={a11yStyles.deviceNote}>
            Your preferences are saved locally to this device.
          </div>
        </div>
      </div>
    </Pane>
  );
}
