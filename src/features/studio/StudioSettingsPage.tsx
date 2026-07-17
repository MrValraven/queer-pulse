import { StudioShell } from "./StudioShell";
import { Translation } from "../../shared/i18n/Translation";
import {
  AudioSection,
  PrivacySection,
  CaptionsSection,
  TippingSection,
  EraseSection,
} from "./StudioSettingsSections";
import s from "./StudioSettingsPage.module.css";

export function StudioSettingsPage() {
  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>
          <Translation i18nKey="studio:settings.eyebrow" />
        </div>
        <h1>
          <Translation
            i18nKey="studio:settings.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={s.dek}>
          <Translation
            i18nKey="studio:settings.dek"
            components={{ em: <em /> }}
          />
        </p>
      </div>

      <div className={s.wrap}>
        <AudioSection />
        <PrivacySection />
        <CaptionsSection />
        <TippingSection />
        <EraseSection />
      </div>
    </StudioShell>
  );
}
