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

  // These secondary CTAs (updates / mentoring / see-all / post-help / story)
  // have no backend yet. Only the prototype fires a "success" toast; live shows
  // an honest coming-soon note instead of confirming an action that never ran.
  const comingSoon = () =>
    showToast(t("economy:housingCoop.toast.liveComingSoon"), "info");

  const onCta = (coop: FormingCoop) => {
    if (coop.cta.kind === "join") {
      setJoining(coop);
    } else if (!demoMode) {
      comingSoon();
    } else if (coop.cta.kind === "updates") {
      showToast(
        t("economy:housingCoop.toast.updates", { name: coop.name }),
        "success",
      );
    } else {
      showToast(t("economy:housingCoop.toast.mentoring"), "success");
    }
  };

  return (
    <PageShell>
      <CoopHero />
      <CoopPhases />
      <CoopGrid
        onCta={onCta}
        onSeeAll={() =>
          demoMode ? showToast(t("economy:housingCoop.toast.seeAll")) : comingSoon()
        }
        onStart={() =>
          demoMode
            ? showToast(t("economy:housingCoop.toast.postHelp"), "success")
            : comingSoon()
        }
      />
      <CoopTemplates />
      <CoopStartCta
        onPost={() =>
          demoMode
            ? showToast(t("economy:housingCoop.toast.postHelp"), "success")
            : comingSoon()
        }
        onStory={() =>
          demoMode ? showToast(t("economy:housingCoop.toast.story")) : comingSoon()
        }
      />

      {joining && (
        <JoinCoopModal coop={joining} onClose={() => setJoining(null)} />
      )}
    </PageShell>
  );
}
