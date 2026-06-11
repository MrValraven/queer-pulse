import { PageShell } from "../../shared/components/layout";
import {
  HarmReductionEmergencyStrip,
  HarmReductionHero,
  HarmReductionGrid,
  HarmReductionOutro,
} from "./HarmReductionSections";

export function HarmReductionPage() {
  return (
    <PageShell>
      <HarmReductionEmergencyStrip />
      <HarmReductionHero />
      <HarmReductionGrid />
      <HarmReductionOutro />
    </PageShell>
  );
}
