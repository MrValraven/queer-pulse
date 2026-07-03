import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
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
  const { showToast } = useToast();
  const [joining, setJoining] = useState<FormingCoop | null>(null);

  const onCta = (coop: FormingCoop) => {
    if (coop.cta.kind === "join") {
      setJoining(coop);
    } else if (coop.cta.kind === "updates") {
      showToast(`You'll get ${coop.name}'s updates in your feed.`, "success");
    } else {
      showToast("Mentoring request sent to Casa Sambizanga.", "success");
    }
  };

  return (
    <PageShell>
      <CoopHero />
      <CoopPhases />
      <CoopGrid
        onCta={onCta}
        onSeeAll={() => showToast("The full co-op directory is coming soon.")}
      />
      <CoopTemplates
        onDownload={(name) => showToast(`Preparing “${name}” for download…`)}
      />
      <CoopStartCta
        onPost={() =>
          showToast(
            "We'll help you find your people — check your inbox.",
            "success",
          )
        }
        onStory={() => showToast("Casa Sambizanga's story is coming soon.")}
      />

      {joining && (
        <JoinCoopModal coop={joining} onClose={() => setJoining(null)} />
      )}
    </PageShell>
  );
}
