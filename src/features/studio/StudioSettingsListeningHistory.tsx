import { useState } from "react";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { StudioClearListeningDialog } from "./StudioClearListeningDialog";
import { SettingsSection, ToggleOption } from "./StudioSettingsOption";
import settingsStyles from "./StudioSettingsPage.module.css";

/**
 * The server Listening history switch in Studio Settings: the same switch
 * the Your listening page holds, with Clear beside it and a link to the
 * page. Until the stored row loads the switch shows the default and waits.
 */
export function StudioSettingsListeningHistory() {
  const { t } = useTranslation();
  const { isOn, isAwaitingRow, setOn } = useStudioListeningHistorySwitch();
  const [isClearOpen, setIsClearOpen] = useState(false);
  return (
    <SettingsSection
      labelKey="studio:settingsLive.history.label"
      titleKey="studio:settingsLive.history.title"
    >
      <ToggleOption
        headingKey="studio:listening.history.heading"
        bodyKey="studio:listening.history.body"
        isOn={isOn}
        isLoading={isAwaitingRow}
        onToggle={() => setOn(!isOn)}
        action={
          <div className={settingsStyles.optActions}>
            <Button variant="quiet" size="sm" to={routes.studioListening}>
              {t("studio:listening.notice.cta")}
            </Button>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => setIsClearOpen(true)}
            >
              {t("studio:listening.clearCta")}
            </Button>
          </div>
        }
      />
      <StudioClearListeningDialog
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
      />
    </SettingsSection>
  );
}
