import { useTheme } from "../../app/providers/themeContext";
import { useStudioPlaybackPreferences } from "./api/useStudioPlaybackPreferences";
import { Collapse } from "../../shared/components/ui";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioCrossfadeSetting } from "./StudioCrossfadeSetting";
import { SettingsSection, ToggleOption } from "./StudioSettingsOption";
import s from "./StudioSettingsPage.module.css";

/**
 * Studio's real player settings, in both modes (spec 6.2): Playback
 * (Autoplay next and Crossfade), Content (Hide explicit tracks) and Theme
 * (the app theme the account menu switches too).
 */
export function StudioPlaybackSettings() {
  const { preferences, isLoading, isError, loadState, savePreferences } =
    useStudioPlaybackPreferences();
  // Until the stored row is on screen the controls only show defaults.
  const isAwaitingRow = isLoading || isError;
  // Studio safety (spec 6.3): on unless the member switched it off.
  const isAskingBeforeWarnings = preferences.askBeforeWarnings !== false;
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <Collapse isOpen={isError}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.playbackSettings"
        />
      </Collapse>
      <SettingsSection
        labelKey="studio:settingsLive.playback.label"
        titleKey="studio:settingsLive.playback.title"
      >
        <ToggleOption
          headingKey="studio:settingsLive.autoplay.heading"
          bodyKey="studio:settingsLive.autoplay.body"
          isOn={preferences.autoplayNext}
          isLoading={isAwaitingRow}
          onToggle={() =>
            savePreferences({ autoplayNext: !preferences.autoplayNext })
          }
        />
        <div className={`${s.opt} ${s.optBlock}`}>
          <StudioCrossfadeSetting
            seconds={preferences.crossfadeSeconds}
            isLoading={isAwaitingRow}
            onCommit={(crossfadeSeconds) =>
              savePreferences({ crossfadeSeconds })
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection
        labelKey="studio:settingsLive.content.label"
        titleKey="studio:settingsLive.content.title"
      >
        <ToggleOption
          headingKey="studio:settingsLive.hideExplicit.heading"
          bodyKey="studio:settingsLive.hideExplicit.body"
          isOn={preferences.hideExplicit}
          isLoading={isAwaitingRow}
          onToggle={() =>
            savePreferences({ hideExplicit: !preferences.hideExplicit })
          }
        />
        <ToggleOption
          headingKey="studio:settingsLive.askBeforeWarnings.heading"
          bodyKey="studio:settingsLive.askBeforeWarnings.body"
          isOn={isAskingBeforeWarnings}
          isLoading={isAwaitingRow}
          onToggle={() =>
            savePreferences({ askBeforeWarnings: !isAskingBeforeWarnings })
          }
        />
      </SettingsSection>

      <SettingsSection
        labelKey="studio:settingsLive.theme.label"
        titleKey="studio:settingsLive.theme.title"
      >
        <ToggleOption
          headingKey="studio:settingsLive.theme.dark.heading"
          bodyKey="studio:settingsLive.theme.dark.body"
          isOn={theme === "dark"}
          isLoading={false}
          onToggle={toggleTheme}
        />
      </SettingsSection>
    </>
  );
}
