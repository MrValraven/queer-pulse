import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { FadeIn } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { routes } from "../../../app/routeMap";
import { useCreatedCommunities } from "../../../app/providers/CreatedCommunitiesProvider";
import { useCommunityMembership } from "../../../app/providers/CommunityMembershipProvider";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { currentUserSlug } from "../../members/data/members";
import { useCreateCommunity } from "../api/useCommunityMutations";
import { draftToCreateDto } from "../api/communities.adapters";
import { TOTAL_STEPS, type CreatedCommunity } from "./startCommunity.data";
import { useCommunityForm } from "./useCommunityForm";
import {
  FoundingThread,
  PanelActions,
  ChapterHead,
} from "./StartCommunityChrome";
import { StartCommunityPreview } from "./StartCommunityPreview";
import { StepOpening } from "./StartCommunityOpening";
import { StepWhy, StepWho } from "./StartCommunityIdentity";
import { StepSafety } from "./StartCommunityAccess";
import { StepRunning } from "./StartCommunityRunning";
import { StepTone } from "./StartCommunityTone";
import { StepFeeling } from "./StartCommunityFeeling";
import { StepPeople } from "./StartCommunityPeople";
import { StepConfirm } from "./StartCommunityConfirm";
import { StartCommunitySuccess } from "./StartCommunitySuccess";
import styles from "./StartCommunityPage.module.css";

type Phase = "form" | "opening" | "done";

const NEXT_LABELS = [
  "Let's begin →",
  "Next: the people →",
  "Next: the door →",
  "Next: who runs it →",
  "Next: the tone →",
  "Next: the feeling →",
  "Next: the first few →",
  "Review & open →",
  "Open the doors →",
];

export function StartCommunityPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { createCommunity } = useCreatedCommunities();
  const { createOwned } = useCommunityMembership();
  const create = useCreateCommunity();

  const form = useCommunityForm();
  const { draft } = form;
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const [created, setCreated] = useState<CreatedCommunity | null>(null);

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    },
    [],
  );

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goToStep = (n: number) => {
    setStep(n);
    scrollUp();
  };

  const next = () => {
    if (!form.canAdvance(step)) return;
    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
      return;
    }
    // final step → found the community
    setPhase("opening");
    scrollUp();
    // Live: POST /communities, then land in the new community's hub. Demo keeps
    // the in-page create-it-live success (no network, no navigation).
    if (!demoMode) {
      create.mutate(draftToCreateDto(draft), {
        onSuccess: (dto) => {
          if (dto) navigate(`/community/${dto.slug}`);
        },
        onError: () => {
          showToast("Couldn't open your community — try again.", "error");
          setPhase("form");
        },
      });
      return;
    }
    openTimer.current = setTimeout(() => {
      const record = createCommunity(draft, currentUserSlug);
      createOwned(record.slug);
      setCreated(record);
      setPhase("done");
      showToast(`${record.name} is live — welcome, steward`, "success");
      scrollUp();
    }, 1500);
  };

  const back = () => {
    if (step === 0) navigate(routes.communitiesHome);
    else goToStep(step - 1);
  };

  const startAnother = () => {
    form.reset();
    setCreated(null);
    setStep(0);
    setPhase("form");
    scrollUp();
  };

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={`${styles.heroInner} wrap`}>
          <Link to={routes.communitiesHome} className={styles.back}>
            <FiArrowLeft size={14} /> Back to your communities
          </Link>
          <div className={styles.eyebrow}>Communities · found a space</div>
          <h1 className={styles.h1}>
            Start a <em>community.</em>
          </h1>
          <p className={styles.lead}>
            A place for your people to gather — social, support, creative, or
            something only you can name.{" "}
            <b>Nothing goes live until you're ready.</b>
          </p>
        </div>
      </header>

      <div className="wrap">
        {phase === "form" && (
          <div className={styles.page}>
            <div className={styles.grid}>
              <div>
                <FoundingThread step={step} onJump={goToStep} />
                <FadeIn key={step}>
                  <div>
                    {step > 0 && <ChapterHead index={step} />}
                    {step === 0 && (
                      <>
                        <ChapterHead index={0} />
                        <StepOpening />
                      </>
                    )}
                    {step === 1 && <StepWhy form={form} />}
                    {step === 2 && <StepWho form={form} />}
                    {step === 3 && <StepSafety form={form} />}
                    {step === 4 && <StepRunning form={form} />}
                    {step === 5 && <StepTone form={form} />}
                    {step === 6 && <StepFeeling form={form} />}
                    {step === 7 && <StepPeople form={form} />}
                    {step === 8 && (
                      <StepConfirm form={form} onEdit={goToStep} />
                    )}
                    <PanelActions
                      onBack={back}
                      backLabel={step === 0 ? "Cancel" : "← Back"}
                      onNext={next}
                      nextLabel={NEXT_LABELS[step] ?? "Continue →"}
                      missing={form.missing[step] ?? []}
                      flush={step === 0}
                    />
                  </div>
                </FadeIn>
              </div>

              <StartCommunityPreview draft={draft} />
            </div>
          </div>
        )}

        {phase === "opening" && (
          <div className={styles.page}>
            <div className={styles.statusPanel}>
              <div className={styles.ring} />
              <p>Opening the doors…</p>
            </div>
          </div>
        )}

        {phase === "done" && created && (
          <div className={styles.page}>
            <StartCommunitySuccess
              community={created}
              onAnother={startAnother}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
