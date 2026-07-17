import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const [joining, setJoining] = useState<FormingCoop | null>(null);

  const onCta = (coop: FormingCoop) => {
    if (coop.cta.kind === "join") {
      setJoining(coop);
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
        onSeeAll={() => showToast(t("economy:housingCoop.toast.seeAll"))}
      />
      <CoopTemplates
        onDownload={(name) =>
          showToast(t("economy:housingCoop.toast.preparingDownload", { name }))
        }
      />
      <CoopStartCta
        onPost={() =>
          showToast(t("economy:housingCoop.toast.postHelp"), "success")
        }
        onStory={() => showToast(t("economy:housingCoop.toast.story"))}
      />

      {joining && (
        <JoinCoopModal coop={joining} onClose={() => setJoining(null)} />
      )}
    </PageShell>
  );
}
