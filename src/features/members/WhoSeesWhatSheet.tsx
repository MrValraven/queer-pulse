import { SideSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { WhoSeesWhatPresets } from "./WhoSeesWhatPresets";
import { WhoSeesWhatFieldToggles } from "./WhoSeesWhatFieldToggles";
import { WhoSeesWhatIdentities } from "./WhoSeesWhatIdentities";
import { WhoSeesWhatHiddenFrom } from "./WhoSeesWhatHiddenFrom";
import { WhoSeesWhatReports } from "./WhoSeesWhatReports";
import { WhoSeesWhatNameChange } from "./WhoSeesWhatNameChange";

/**
 * "Who sees what" — the full profile-visibility settings surface, gathering
 * six otherwise-scattered controls (presets, the four instant-save field
 * toggles, per-identity discoverability, per-person hiding, a receipt list of
 * reports this member has filed, and a link to the handle-change form) into
 * one right-edge sheet. Pure composition: each section owns its own data
 * fetching/mutations and reads the shared `ProfileEdit`/`DemoMode` context
 * directly, so this orchestrator has nothing to wire between them.
 */
export function WhoSeesWhatSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <SideSheet title={t("members:profile.whoSeesWhat.title")} onClose={onClose}>
      <WhoSeesWhatPresets />
      <WhoSeesWhatFieldToggles />
      <WhoSeesWhatIdentities />
      <WhoSeesWhatHiddenFrom />
      <WhoSeesWhatReports />
      <WhoSeesWhatNameChange />
    </SideSheet>
  );
}
