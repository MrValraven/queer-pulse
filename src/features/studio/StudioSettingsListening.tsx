import { useStudioListeningPreferences } from "./player/useStudioPlayerPreferences";
import { SettingsSection, ToggleOption } from "./StudioSettingsOption";
import { StudioSettingsListeningHistory } from "./StudioSettingsListeningHistory";

/** The listening settings: first the server Listening history switch (with
 *  Clear and a link to Your listening), then the two device switches, which
 *  live in this browser's storage and stay on this device. */
export function StudioListeningSettings() {
  const {
    preferences,
    setShouldResumeAcrossSessions,
    setSingleKeyShortcutsOn,
  } = useStudioListeningPreferences();
  return (
    <>
      <StudioSettingsListeningHistory />
      <SettingsSection
        labelKey="studio:settingsLive.device.label"
        titleKey="studio:settingsLive.device.title"
      >
        <ToggleOption
          headingKey="studio:settingsLive.singleKey.heading"
          bodyKey="studio:settingsLive.singleKey.body"
          isOn={preferences.areSingleKeyShortcutsOn}
          onToggle={() =>
            setSingleKeyShortcutsOn(!preferences.areSingleKeyShortcutsOn)
          }
        />
        <ToggleOption
          headingKey="studio:settingsLive.resume.heading"
          bodyKey="studio:settingsLive.resume.body"
          isOn={preferences.shouldResumeAcrossSessions}
          onToggle={() =>
            setShouldResumeAcrossSessions(
              !preferences.shouldResumeAcrossSessions,
            )
          }
        />
      </SettingsSection>
    </>
  );
}
