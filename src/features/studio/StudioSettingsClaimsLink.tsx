import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioClaimsPath } from "./studioClaimPaths";
import { SettingsSection } from "./StudioSettingsPlayback";
import s from "./StudioSettingsPage.module.css";

/** The settings page's way to the member's copyright claims (spec 8), in
 *  the same section shape as the playback settings above it. */
export function StudioSettingsClaimsLink() {
  const { t } = useTranslation();
  return (
    <SettingsSection
      labelKey="studio:settingsLive.claims.label"
      titleKey="studio:settingsLive.claims.title"
    >
      <div className={s.opt}>
        <div className={s.ot}>
          <h3>{t("studio:settingsLive.claims.heading")}</h3>
          <p>{t("studio:settingsLive.claims.body")}</p>
        </div>
        <Button variant="ghost" size="sm" to={studioClaimsPath()}>
          {t("studio:settingsLive.claims.cta")}
        </Button>
      </div>
    </SettingsSection>
  );
}
