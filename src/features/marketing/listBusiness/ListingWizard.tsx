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
  type ListingStatus,
  type PendingListing,
} from "./listBusiness.data";
import { useListingForm } from "./useListingForm";
import { useListingDraft } from "./useListingDraft";
import { useEditListingSave, useEditUnsavedGuard } from "./useEditListingSave";
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

export interface ListingWizardProps {
  mode: "create" | "edit";
  /** Ref of the listing being edited — present in edit mode. */
  editRef?: string;
  /** Seed draft for edit mode, OR a create-mode draft being resumed (from the
   *  landing drafts list / a `?draft` deep link). Undefined in a fresh create →
   *  the form starts blank. */
  initialDraft?: ListingDraft;
  /** Create-mode resume: the wizard step the resumed draft had reached. */
  initialStep?: number;
  /** Create-mode resume (live): the server draft-row id, so autosave keeps
   *  upserting the same row instead of minting a duplicate. */
  initialDraftId?: string;
  /** The edited listing's public slug — routes back to it on save. */
  editSlug?: string;
  /** The edited listing's status — Live navigates to the public page on
   *  save, anything else navigates back to the account profile. */
  editStatus?: ListingStatus;
}

export function ListingWizard(props: ListingWizardProps) {
  const isEdit = props.mode === "edit";
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addListing, withdrawListing } = useDirectoryListingsActions();
  // The authoring member — real user in live, mock persona in demo (item #3).
  const { profile } = useProfileData();
  const { user } = useAuth();
  const userName = `${profile.first} ${profile.last}`;
  const editSave = useEditListingSave({
    editRef: props.editRef,
    editSlug: props.editSlug,
    editStatus: props.editStatus,
  });
  // Prefill create-mode from the member (item #3). Create-only: `useListingForm`
  // applies it only when building a blank draft (no `initialDraft`). Memoised so
  // the form's `reset` keeps a stable identity across renders.
  const seed = useMemo(
    () =>
      isEdit
        ? undefined
        : {
            ownerName: userName.trim(),
            ownerBio: profile.bio ?? "",
            contactEmail: user?.email ?? "",
          },
    [isEdit, userName, profile.bio, user?.email],
  );
  const form = useListingForm(props.initialDraft, seed);
  const { draft } = form;
  const uploadPhoto = useUploadImage("listing-photo");
  // A create-mode draft resumed from the landing list / a `?draft` deep link.
  const isResumed = !isEdit && Boolean(props.initialDraft);
  // Edit seeds past StepPath (step 0); a resumed create draft lands on its step.
  const [step, setStep] = useState(isEdit ? 1 : (props.initialStep ?? 0));
  const [phase, setPhase] = useState<Phase>("form");
  const [listing, setListing] = useState<PendingListing | null>(null);

  // Autosave/resume is create-only — edit must never touch that draft slot. A
  // resumed draft keeps autosaving but doesn't re-offer the in-wizard banner.
  const { saved, savedAt, clearDraft, saveAndExit } = useListingDraft(draft, step, {
    enabled: !isEdit,
    offerResume: !isEdit && !isResumed,
    initialDraftId: props.initialDraftId,
  });
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
  useEditUnsavedGuard(isEdit, draft, props.initialDraft, phase === "form");
  // Guard against setState after unmount mid-send. Reset on setup so
  // StrictMode's mount→cleanup→remount doesn't leave the ref stuck at false.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goToStep = (n: number) => {
    // Step 0 (StepPath) is locked in edit mode — clamp any jump there to step 1.
    setStep(isEdit ? Math.max(1, n) : n);
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
    if (isEdit) {
      try {
        await editSave.saveEdit(draft);
      } catch (error) {
        if (!mountedRef.current) return;
        setPhase("form");
        routeSubmitError(error, () => editSave.showSaveError());
      }
      return;
    }
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
    if (isEdit) {
      // Defensive clamp — WizardFormPane already hides Back on step 1.
      if (step > 1) goToStep(step - 1);
      return;
    }
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
              isSaveLaterVisible={!isEdit && draft.path !== ""}
              onSaveLater={() => void saveAndFinishLater()}
              isSavingLater={savingLater}
            />
            <WizardFormPane
              mode={props.mode}
              editRef={props.editRef}
              editSlug={props.editSlug}
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

        {phase === "sending" && <SendingPanel isEdit={isEdit} />}

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
