import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { FadeIn } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useCreateCommunity } from "../api/useCommunityMutations";
import { draftToCreateDto } from "../api/communities.adapters";
import { TOTAL_STEPS, type CreatedCommunity } from "./startCommunity.data";
import { createCommunityRecord } from "./createdCommunities.store";
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

const NEXT_LABEL_KEYS = [
  "communities:start.next.begin",
  "communities:start.next.people",
  "communities:start.next.door",
  "communities:start.next.who",
  "communities:start.next.tone",
  "communities:start.next.feeling",
  "communities:start.next.first",
  "communities:start.next.review",
  "communities:start.next.open",
];

/** Page header: back link, eyebrow, and the coral-`<em>` title/lead. */
function StartCommunityHero() {
  const { t } = useTranslation();
  return (
    <header className={styles.hero}>
      <div className={`${styles.heroInner} wrap`}>
        <Link to={routes.communities} className={styles.back}>
          <FiArrowLeft size={14} /> {t("communities:start.hero.back")}
        </Link>
        <div className={styles.eyebrow}>
          {t("communities:start.hero.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="communities:start.hero.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="communities:start.hero.lead"
            components={{ strong: <b /> }}
          />
        </p>
      </div>
    </header>
  );
}

export function StartCommunityPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
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

  // Warn before an in-progress community is abandoned. Only while still on the
  // form: once founding begins (phase "opening"/"done") the guard is inactive, so
  // the live-mode redirect into the brand-new community hub navigates freely.
  useUnsavedChangesGuard({
    active: phase === "form" && form.dirty,
    confirmMessage: t("communities:start.leaveConfirm"),
  });

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
          if (dto) void navigate(`/community/${dto.slug}`);
        },
        onError: () => {
          showToast(t("communities:start.toast.createError"), "error");
          setPhase("form");
        },
      });
      return;
    }
    openTimer.current = setTimeout(() => {
      const record = createCommunityRecord(draft, user?.profile.slug ?? "");
      createOwned(record.slug);
      setCreated(record);
      setPhase("done");
      showToast(
        t("communities:start.toast.created", { name: record.name }),
        "success",
      );
      scrollUp();
    }, 1500);
  };

  const back = () => {
    if (step === 0) void navigate(routes.communities);
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
      <StartCommunityHero />

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
                      backLabel={
                        step === 0 ? (
                          t("communities:start.cancel")
                        ) : (
                          <>
                            <FiArrowLeft aria-hidden />{" "}
                            {t("communities:start.back")}
                          </>
                        )
                      }
                      onNext={next}
                      nextLabel={t(
                        NEXT_LABEL_KEYS[step] ??
                          "communities:start.next.fallback",
                      )}
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
              <p>{t("communities:start.opening.status")}</p>
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
