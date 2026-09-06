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
import { MyHousingJoinRequests } from "./MyHousingJoinRequests";
import { useMyCoopJoinRequests } from "./api/useMyHousingJoinRequests";
import type { FormingCoop } from "./housingCoop.data";

export function HousingCoopPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const [joining, setJoining] = useState<FormingCoop | null>(null);
  // PRD-242. Where the `housing_join_decided` bell row lands: this page is the
  // co-op deep link, so the application it decided has to be visible on it.
  const { data: myJoinRequests, isLoading: isLoadingMyJoinRequests } =
    useMyCoopJoinRequests();

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
      {/* Held back until the read settles. Having applied is the exception
          rather than the rule, so a skeleton would announce a section most
          readers will never have. */}
      {!isLoadingMyJoinRequests && (
        <MyHousingJoinRequests
          requests={myJoinRequests ?? []}
          titleKey="economy:housingJoinRequests.coop.title"
          titleEmKey="economy:housingJoinRequests.coop.titleEm"
          subKey="economy:housingJoinRequests.coop.sub"
        />
      )}
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
