import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningPreferences } from "./player/useStudioPlayerPreferences";
import { useStudioRecentlyPlayed } from "./player/useStudioRecentlyPlayed";
import { SettingsSection, ToggleOption } from "./StudioSettingsOption";

/** The three device-only listening switches. They live in this browser's
 *  storage and never reach the server. */
export function StudioListeningSettings() {
  const { t } = useTranslation();
  const {
    preferences,
    setShouldResumeAcrossSessions,
    setRecentlyPlayedOn,
    setSingleKeyShortcutsOn,
  } = useStudioListeningPreferences();
  const { entries, clear } = useStudioRecentlyPlayed();
  return (
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
          setShouldResumeAcrossSessions(!preferences.shouldResumeAcrossSessions)
        }
      />
      <ToggleOption
        headingKey="studio:settingsLive.recent.heading"
        bodyKey="studio:settingsLive.recent.body"
        isOn={preferences.isRecentlyPlayedOn}
        onToggle={() => setRecentlyPlayedOn(!preferences.isRecentlyPlayedOn)}
        action={
          <Collapse isOpen={entries.length > 0}>
            <Button variant="quiet" size="sm" onClick={clear}>
              {t("studio:settingsLive.recent.clear")}
            </Button>
          </Collapse>
        }
      />
    </SettingsSection>
  );
}
