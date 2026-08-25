import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useDirectoryListingsActions } from "../../../app/providers/useDirectoryListingsActions";
import { useProfileData } from "../../../app/providers/useProfile";
import { useAuth } from "../../../app/providers/authContext";
import { useUploadImage } from "../../members/api/useUploadImage";
import {
  TOTAL_STEPS,
  type ListingDraft,
  type PendingListing,
} from "./listBusiness.data";
import { useListingForm } from "./useListingForm";
import { useListingDraft } from "./useListingDraft";
import { DraftBanner, SendingPanel } from "./ListBusinessChrome";
import { WizardFormPane } from "./WizardFormPane";
import { ListBusinessSuccess } from "./ListBusinessSuccess";
import { WizardFormChrome } from "./WizardExtras";
import { useListingDraftBanner } from "./useListingDraftBanner";
import { useListingSubmit } from "./useListingSubmit";
import styles from "./ListBusinessPage.module.css";

type Phase = "form" | "sending" | "success";

// Floor for the "sending" ring so it's always visible; live mode also waits
// for the real POST round-trip, whichever is longer.
const MIN_SEND_MS = 700;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The guided six-step flow for submitting a NEW listing.
 *
 * Create-only by design. Editing an existing listing is a different job and
 * has its own surface (`editor/ListingEditor`, mounted by the `/:ref` route):
 * an owner arrives to change one line and should not walk a step sequence to
 * reach it. Both surfaces render the same field components (see `./fields`),
 * so there is one copy of every input and one set of validation rules.
 */
export interface ListingWizardProps {
  /** A create-mode draft being resumed (from the landing drafts list or a
   *  `?draft` deep link). Undefined in a fresh create, so the form starts
   *  blank. */
  initialDraft?: ListingDraft;
  /** The wizard step the resumed draft had reached. */
  initialStep?: number;
  /** Live resume: the server draft-row id, so autosave keeps upserting the
   *  same row instead of minting a duplicate. */
  initialDraftId?: string;
}

export function ListingWizard(props: ListingWizardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addListing, withdrawListing } = useDirectoryListingsActions();
  // The authoring member — real user in live, mock persona in demo (item #3).
  const { profile } = useProfileData();
  const { user } = useAuth();
  const userName = `${profile.first} ${profile.last}`;
  // Prefill from the member (item #3). `useListingForm` applies it only when
  // building a blank draft (no `initialDraft`). Memoised so the form's `reset`
  // keeps a stable identity across renders.
  const seed = useMemo(
    () => ({
      ownerName: userName.trim(),
      ownerBio: profile.bio ?? "",
      contactEmail: user?.email ?? "",
    }),
    [userName, profile.bio, user?.email],
  );
  const form = useListingForm(props.initialDraft, seed);
  const { draft } = form;
  const uploadPhoto = useUploadImage("listing-photo");
  // A draft resumed from the landing list / a `?draft` deep link.
  const isResumed = Boolean(props.initialDraft);
  const [step, setStep] = useState(props.initialStep ?? 0);
  const [phase, setPhase] = useState<Phase>("form");
  const [listing, setListing] = useState<PendingListing | null>(null);

  // A resumed draft keeps autosaving but doesn't re-offer the in-wizard banner.
  const { saved, savedAt, clearDraft, saveAndExit } = useListingDraft(
    draft,
    step,
    {
      enabled: true,
      offerResume: !isResumed,
      initialDraftId: props.initialDraftId,
    },
  );
  const { isBannerVisible, resumeDraft, discardDraft } = useListingDraftBanner(
    saved,
    clearDraft,
    (resumed) => {
      form.reset(resumed.draft);
      setStep(resumed.step);
    },
  );
  // Item #4 (server 422 → step routing) + item #11 (save & finish later).
  const {
    serverError,
    setServerError,
    savingLater,
    routeSubmitError,
    saveAndFinishLater,
  } = useListingSubmit({ setStep, saveAndExit, flashClass: styles.fieldFlash });
  // Guard against setState after unmount mid-send. Reset on setup so
  // StrictMode's mount→cleanup→remount doesn't leave the ref stuck at false.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goToStep = (n: number) => {
    setStep(n);
    setServerError(null);
    scrollUp();
  };

  const next = async () => {
    if (!form.canAdvance(step)) return;
    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
      return;
    }
    setServerError(null);
    setPhase("sending");
    scrollUp();
    try {
      const [created] = await Promise.all([
        addListing(draft, profile.slug),
        sleep(MIN_SEND_MS),
      ]);
      if (!mountedRef.current) return;
      setListing(created);
      clearDraft();
      setPhase("success");
      showToast(t("marketing:listBusiness.toast.submitted"), "success");
      scrollUp();
    } catch (error) {
      if (!mountedRef.current) return;
      setPhase("form");
      routeSubmitError(error, () =>
        showToast(t("marketing:listBusiness.toast.submitError"), "error"),
      );
    }
  };

  const back = () => {
    if (step === 0) void navigate(routes.directory);
    else goToStep(step - 1);
  };
  const editSubmission = () => {
    setPhase("form");
    setStep(TOTAL_STEPS - 1);
    scrollUp();
  };
  const withdraw = () => {
    if (listing) withdrawListing(listing.ref);
    showToast(t("marketing:listBusiness.toast.withdrawn"), "info");
    void navigate(routes.directory);
  };
  const listAnother = () => {
    form.reset();
    setListing(null);
    setStep(0);
    setPhase("form");
    scrollUp();
  };
  return (
    <>
      {phase === "form" && isBannerVisible && saved && (
        <DraftBanner onResume={resumeDraft} onDiscard={discardDraft} />
      )}
      <div className="wrap">
        {phase === "form" && (
          <>
            <WizardFormChrome
              serverError={serverError}
              onDismissError={() => setServerError(null)}
              isSaveLaterVisible={draft.path !== ""}
              onSaveLater={() => void saveAndFinishLater()}
              isSavingLater={savingLater}
            />
            <WizardFormPane
              form={form}
              step={step}
              savedAt={savedAt}
              userName={userName}
              userInitials={profile.initials}
              draft={draft}
              goToStep={goToStep}
              onBack={back}
              onNext={() => void next()}
              uploadPhoto={uploadPhoto}
            />
          </>
        )}

        {phase === "sending" && <SendingPanel />}

        {phase === "success" && listing && (
          <div className={styles.page}>
            <ListBusinessSuccess
              listing={listing}
              onEdit={editSubmission}
              onWithdraw={withdraw}
              onAnother={listAnother}
            />
          </div>
        )}
      </div>
    </>
  );
}
