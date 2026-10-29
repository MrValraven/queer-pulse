import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioListeningSettings } from "./StudioSettingsListening";
import { StudioSettingsClaimsLink } from "./StudioSettingsClaimsLink";
import { StudioSettingsGettingPaid } from "./StudioSettingsGettingPaid";
import { StudioPlaybackSettings } from "./StudioSettingsPlayback";
import {
  AudioSection,
  CaptionsSection,
  EraseSection,
  PrivacySection,
  TippingSection,
} from "./StudioSettingsSections";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./StudioSettingsPage.module.css";

/** Studio settings: the three real player settings in both modes; the
 *  co-op's quality, privacy, captions, tipping and erase sections in the
 *  demo only (spec 6.2). */
export function StudioSettingsPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  useStudioDocumentTitle(t("studio:settingsLive.pageTitle"));
  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:settingsLive.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:settingsLive.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={s.dek}>{t("studio:settingsLive.dek")}</p>
      </div>

      <div className={s.wrap}>
        <StudioPlaybackSettings />
        <StudioListeningSettings />
        <StudioSettingsGettingPaid />
        <StudioSettingsClaimsLink />
        {isShowcase && (
          <>
            <AudioSection />
            <PrivacySection />
            <CaptionsSection />
            <TippingSection />
            <EraseSection />
          </>
        )}
      </div>
    </StudioShell>
  );
}
