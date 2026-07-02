import { StudioShell } from "./StudioShell";
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
        <div className={s.eb}>Your room · settings</div>
        <h1>
          How the room <em>treats</em> you.
        </h1>
        <p className={s.dek}>
          Audio, privacy, captions, tipping. Nothing here is on unless you turn
          it on — and anything you turn on, you can erase in{" "}
          <em>one tap, no confirmation modal</em>.
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
