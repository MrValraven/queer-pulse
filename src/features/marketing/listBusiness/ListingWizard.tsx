import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useDirectoryListingsActions } from "../../../app/providers/useDirectoryListingsActions";
import { useProfile } from "../../../app/providers/useProfile";
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
  /** Seed draft for edit mode; undefined in create → the form starts blank. */
  initialDraft?: ListingDraft;
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
  // The signed-in member the listing is authored by — the real user in live
  // mode, the mock persona in demo (never the hardcoded `currentUser`/slug).
  const { profile } = useProfile();
  const userName = `${profile.first} ${profile.last}`;
  const editSave = useEditListingSave({
    editRef: props.editRef,
    editSlug: props.editSlug,
    editStatus: props.editStatus,
  });
  const form = useListingForm(props.initialDraft);
  const { draft } = form;
  const uploadPhoto = useUploadImage("listing-photo");
  // Edit mode seeds past the type/path step (StepPath never shows again).
  const [step, setStep] = useState(isEdit ? 1 : 0);
  const [phase, setPhase] = useState<Phase>("form");
  const [listing, setListing] = useState<PendingListing | null>(null);

  // Autosave/resume is create-only — edit must never touch that draft slot.
  const { saved, savedAt, clearDraft } = useListingDraft(draft, step, !isEdit);
  const [showBanner, setShowBanner] = useState(Boolean(saved));
  useEditUnsavedGuard(isEdit, draft, props.initialDraft, phase === "form");

  // Guard against setState after the page unmounts mid-send. Reset on setup so
  // StrictMode's mount→cleanup→remount doesn't leave the ref stuck at false
  // (which would swallow the success transition and spin the loader forever).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goToStep = (n: number) => {
    // Step 0 (StepPath) is locked in edit mode — clamp any jump there (e.g.
    // the review pane's "Edit" link) to step 1 instead of a blank pane.
    setStep(isEdit ? Math.max(1, n) : n);
    scrollUp();
  };

  const next = async () => {
    if (!form.canAdvance(step)) return;
    if (step < TOTAL_STEPS - 1) {
      goToStep(step + 1);
      return;
    }
    setPhase("sending");
    scrollUp();
    if (isEdit) {
      try {
        await editSave.saveEdit(draft);
      } catch {
        if (!mountedRef.current) return;
        setPhase("form");
        setStep(5);
        editSave.showSaveError();
        scrollUp();
      }
      return;
    }
    // final step → submit for real
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
    } catch {
      if (!mountedRef.current) return;
      setPhase("form");
      setStep(5);
      showToast(t("marketing:listBusiness.toast.submitError"), "error");
      scrollUp();
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

  const editSubmission = () => {
    setPhase("form");
    setStep(5);
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
      {phase === "form" && showBanner && saved && (
        <DraftBanner onResume={resumeDraft} onDiscard={discardDraft} />
      )}

      <div className="wrap">
        {phase === "form" && (
          <WizardFormPane
            mode={props.mode}
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
