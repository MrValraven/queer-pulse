import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { FadeIn } from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useDirectoryListings } from "../../../app/providers/DirectoryListingsProvider";
import { currentUser, currentUserSlug } from "../../members/data/members";
import {
  TOTAL_STEPS,
  type ListingStatus,
  type PendingListing,
} from "./listBusiness.data";
import { useListingForm } from "./useListingForm";
import { useListingDraft } from "./useListingDraft";
import { DraftBanner, PaneActions, WizardChrome } from "./ListBusinessChrome";
import { StepBasics, StepPath, StepStory } from "./ListBusinessSteps";
import { StepPractical } from "./ListBusinessPracticalStep";
import { StepPhotosYou } from "./ListBusinessPhotosStep";
import { StepReview } from "./ListBusinessReviewStep";
import { ListBusinessPreview } from "./ListBusinessPreview";
import { ListBusinessSuccess } from "./ListBusinessSuccess";
import styles from "./ListBusinessPage.module.css";

type Phase = "form" | "sending" | "success";

const NEXT_LABEL_KEYS = [
  "marketing:listBusiness.next.basics",
  "marketing:listBusiness.next.story",
  "marketing:listBusiness.next.practical",
  "marketing:listBusiness.next.photos",
  "marketing:listBusiness.next.review",
  "marketing:listBusiness.next.send",
];

const USER_NAME = `${currentUser.first} ${currentUser.last}`;

export function ListBusinessPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addListing, withdrawListing, setStatus } = useDirectoryListings();

  const form = useListingForm();
  const { draft } = form;
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const [listing, setListing] = useState<PendingListing | null>(null);

  const { saved, savedAt, clearDraft } = useListingDraft(draft, step);
  const [showBanner, setShowBanner] = useState(Boolean(saved));

  // Cancel the simulated-submit timer if the page unmounts mid-send.
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (sendTimer.current) clearTimeout(sendTimer.current);
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
    // final step → submit
    setPhase("sending");
    scrollUp();
    sendTimer.current = setTimeout(() => {
      const created = addListing(draft, currentUserSlug);
      setListing(created);
      clearDraft();
      setPhase("success");
      showToast(t("marketing:listBusiness.toast.submitted"), "success");
      scrollUp();
    }, 1400);
  };

  const back = () => {
    if (step === 0) navigate(routes.directory);
    else goToStep(step - 1);
  };

  const resumeDraft = () => {
    if (saved) {
      form.reset(saved.draft);
      setStep(saved.step);
    }
    setShowBanner(false);
  };
  const discardDraft = () => {
    clearDraft();
    setShowBanner(false);
  };

  const onSetStage = (s: ListingStatus) => {
    if (!listing) return;
    setStatus(listing.ref, s);
    setListing({ ...listing, status: s });
  };
  const editSubmission = () => {
    setPhase("form");
    setStep(5);
    scrollUp();
  };
  const withdraw = () => {
    if (listing) withdrawListing(listing.ref);
    showToast(t("marketing:listBusiness.toast.withdrawn"), "info");
    navigate(routes.directory);
  };
  const listAnother = () => {
    form.reset();
    setListing(null);
    setStep(0);
    setPhase("form");
    scrollUp();
  };

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={`${styles.heroInner} wrap`}>
          <Link to={routes.directory} className={styles.back}>
            <FiArrowLeft size={14} /> {t("marketing:listBusiness.hero.backCta")}
          </Link>
          <div className={styles.eyebrow}>
            {t("marketing:listBusiness.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:listBusiness.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.lead}>
            <Translation
              i18nKey="marketing:listBusiness.hero.lead"
              components={{ b: <b /> }}
            />
          </p>
        </div>
      </header>

      {phase === "form" && showBanner && saved && (
        <DraftBanner onResume={resumeDraft} onDiscard={discardDraft} />
      )}

      <div className="wrap">
        {phase === "form" && (
          <div className={styles.page}>
            <div className={styles.grid}>
              <div>
                <WizardChrome step={step} savedAt={savedAt} />
                <FadeIn key={step}>
                  <div className={styles.pane}>
                    {step === 0 && (
                      <StepPath form={form} userName={USER_NAME} />
                    )}
                    {step === 1 && <StepBasics form={form} />}
                    {step === 2 && <StepStory form={form} />}
                    {step === 3 && <StepPractical form={form} />}
                    {step === 4 && (
                      <StepPhotosYou form={form} userName={USER_NAME} />
                    )}
                    {step === 5 && (
                      <StepReview
                        form={form}
                        userName={USER_NAME}
                        userInitials={currentUser.initials}
                        onEdit={goToStep}
                      />
                    )}
                    <PaneActions
                      onBack={back}
                      backLabel={
                        step === 0
                          ? t("marketing:listBusiness.paneActions.cancel")
                          : undefined
                      }
                      onNext={next}
                      nextLabel={t(
                        NEXT_LABEL_KEYS[step] ??
                          "marketing:listBusiness.next.continue",
                      )}
                      missing={form.missing[step] ?? []}
                    />
                  </div>
                </FadeIn>
              </div>

              <ListBusinessPreview draft={draft} userName={USER_NAME} />
            </div>
          </div>
        )}

        {phase === "sending" && (
          <div className={styles.page}>
            <div className={styles.statusPanel}>
              <div className={styles.statusInner}>
                <div className={styles.sending}>
                  <div className={styles.ring} />
                  <p>{t("marketing:listBusiness.sending")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "success" && listing && (
          <div className={styles.page}>
            <ListBusinessSuccess
              listing={listing}
              onSetStage={onSetStage}
              onEdit={editSubmission}
              onWithdraw={withdraw}
              onAnother={listAnother}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
