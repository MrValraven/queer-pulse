import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  CoopHero,
  CoopPhases,
  CoopGrid,
  CoopTemplates,
  CoopStartCta,
} from "./HousingCoopSections";
import { JoinCoopModal } from "./JoinCoopModal";
import type { FormingCoop } from "./housingCoop.data";

export function HousingCoopPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const [joining, setJoining] = useState<FormingCoop | null>(null);

  // "Ask to join" is real in both modes (JoinCoopModal posts through
  // useSubmitCoopJoinRequest). The secondary CTAs (updates / mentoring /
  // see-all / post-help / story) have no backend, and a toast saying they
  // worked was a fake success. Live mode now passes no handler at all, so each
  // section hides or disables its own control and says why up front. Demo mode
  // keeps the prototype toasts exactly as they were.
  const onCta = (coop: FormingCoop) => {
    if (coop.cta.kind === "join") {
      setJoining(coop);
      return;
    }
    if (!demoMode) return;
    if (coop.cta.kind === "updates") {
      showToast(
        t("economy:housingCoop.toast.updates", { name: coop.name }),
        "success",
      );
    } else {
      showToast(t("economy:housingCoop.toast.mentoring"), "success");
    }
  };

  const postHelp = () =>
    showToast(t("economy:housingCoop.toast.postHelp"), "success");

  return (
    <PageShell>
      <CoopHero />
      <CoopPhases />
      <CoopGrid
        onCta={onCta}
        isSecondaryCtaAvailable={demoMode}
        onSeeAll={
          demoMode
            ? () => showToast(t("economy:housingCoop.toast.seeAll"))
            : undefined
        }
        onStart={demoMode ? postHelp : undefined}
      />
      <CoopTemplates />
      <CoopStartCta
        onPost={demoMode ? postHelp : undefined}
        onStory={
          demoMode
            ? () => showToast(t("economy:housingCoop.toast.story"))
            : undefined
        }
      />

      {joining && (
        <JoinCoopModal coop={joining} onClose={() => setJoining(null)} />
      )}
    </PageShell>
  );
}
