import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CreateGatheringWizard } from "../../gatherings/CreateGatheringPage";
import { EventHostScopeContext } from "../../gatherings/eventHostScope";
import { AdminPageHeader } from "../ui";
import { AdminMusicEventFrame } from "./AdminMusicEventFrame";
import { MUSIC_ADMIN_HOST_SCOPE } from "./musicAdminHostScope";

/**
 * The create wizard for a QueerPulse music event: the member wizard inside
 * the music admin host scope, so it opens on Music, hides the fields a house
 * event never has and publishes through the admin music events API. Keyed on
 * the mode, like the member route, so switching modes starts a fresh form.
 */
export function AdminMusicEventNewPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <EventHostScopeContext.Provider value={MUSIC_ADMIN_HOST_SCOPE}>
      <CreateGatheringWizard
        key={demoMode ? "demo" : "live"}
        Frame={AdminMusicEventFrame}
        head={
          <AdminPageHeader
            eyebrow={t("admin:musicEvents.eyebrow")}
            title={t("admin:musicEvents.new.title")}
            sub={t("admin:musicEvents.new.lead")}
            actions={
              <Button variant="ghost" to={routes.adminMusicEvents}>
                {t("admin:musicEvents.backCta")}
              </Button>
            }
          />
        }
      />
    </EventHostScopeContext.Provider>
  );
}
