import { useCallback, useMemo, useState, type ReactNode } from "react";
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
import { useListingForm, type ListingSeed } from "./useListingForm";
import { useListingDraft } from "./useListingDraft";
import { DraftBanner, SendingPanel } from "./ListBusinessChrome";
import { WizardFormPane } from "./WizardFormPane";
import { ListBusinessSuccess } from "./ListBusinessSuccess";
import { WizardFormChrome } from "./WizardExtras";
import { useListingDraftBanner } from "./useListingDraftBanner";
import { useListingSubmit } from "./useListingSubmit";
import { useListingWizardSubmit } from "./useListingWizardSubmit";
import styles from "./ListBusinessPage.module.css";

type Phase = "form" | "sending" | "success";

/**
 * The guided six-step flow for submitting a NEW listing.
 *
 * Create-only by design. Editing an existing listing is a different job and
 * has its own surface (`editor/ListingEditor`, mounted by the `/:ref` route):
 * an owner arrives to change one line and should not walk a step sequence to
 * reach it. Both surfaces render the same field components (see `./fields`),
 * so there is one copy of every input and one set of validation rules.
 *
 * Every prop below the first three is a seam for an admin console that
 * authors a listing on a business's behalf. All are optional and each one
 * defaults to the member flow's existing expression, so a `<ListingWizard />`
 * with no new props behaves exactly as it did before the seams existed.
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
  /** Persist the finished draft and resolve with the created record.
   *  Defaults to the member's own `addListing(draft, profile.slug)`. */
  submit?: (draft: ListingDraft) => Promise<PendingListing>;
  /** Pre-fill for a BLANK draft. Defaults to the signed-in member's name,
   *  bio and email. */
  seed?: ListingSeed;
  /** The name shown in the preview, the owner block and the vouch line.
   *  Defaults to the signed-in member's full name. */
  userName?: string;
  /** The initials shown on the review step's vouch line. Defaults to the
   *  signed-in member's initials. */
  userInitials?: string;
  /** Whether the draft autosaves. Defaults to true, the member behaviour.
   *  A console passes false, because autosave writes member-scoped draft
   *  rows and an admin's console has no business minting one. */
  isDraftAutosaveEnabled?: boolean;
  /** Leaving the wizard from step 0's back button. Defaults to navigating to
   *  the directory. */
  onCancel?: () => void;
  /** Leaving after withdrawing the submitted listing. Defaults to navigating
   *  to the directory. */
  onDone?: () => void;
  /** Replace the success panel. Left out, the wizard renders
   *  `ListBusinessSuccess`. Supplied, whatever it returns is rendered, so
   *  returning `null` shows nothing at all. */
  renderSuccess?: (created: PendingListing) => ReactNode;
}

export function ListingWizard({
  initialDraft,
  initialStep,
  initialDraftId,
  submit,
  seed,
  userName,
  userInitials,
  isDraftAutosaveEnabled,
  onCancel,
  onDone,
  renderSuccess,
}: ListingWizardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addListing, withdrawListing } = useDirectoryListingsActions();
  // The authoring member: real user in live, mock persona in demo (item #3).
  // Both reads stay unconditional, because hooks cannot be conditional. They
  // are cheap context reads, and a console that supplies its own name, seed
  // and submit ignores the values.
  const { profile } = useProfileData();
  const { user } = useAuth();
  const memberName = `${profile.first} ${profile.last}`;
  const resolvedUserName = userName ?? memberName;
  const resolvedUserInitials = userInitials ?? profile.initials;
  // Prefill from the member (item #3). `useListingForm` applies it only when
  // building a blank draft (no `initialDraft`). Memoised so the form's `reset`
  // keeps a stable identity across renders.
  const resolvedSeed = useMemo(
    () =>
      seed ?? {
        ownerName: resolvedUserName.trim(),
        ownerBio: profile.bio ?? "",
        contactEmail: user?.email ?? "",
      },
    [seed, resolvedUserName, profile.bio, user?.email],
  );
  const form = useListingForm(initialDraft, resolvedSeed);
  const { draft } = form;
  const uploadPhoto = useUploadImage("listing-photo");
  // A draft resumed from the landing list / a `?draft` deep link.
  const isResumed = Boolean(initialDraft);
  const [step, setStep] = useState(initialStep ?? 0);
  const [phase, setPhase] = useState<Phase>("form");
  const [listing, setListing] = useState<PendingListing | null>(null);

  const isAutosaveOn = isDraftAutosaveEnabled ?? true;
  // A resumed draft keeps autosaving but doesn't re-offer the in-wizard banner.
  const { saved, savedAt, clearDraft, saveAndExit } = useListingDraft(
    draft,
    step,
    {
      enabled: isAutosaveOn,
      offerResume: !isResumed,
      initialDraftId,
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
  } = useListingSubmit({
    setStep,
    saveAndExit,
    flashClass: styles.fieldFlash,
    onPhotosRejected: form.setRejectedPhotoSlots,
  });
  const scrollUp = useCallback(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    [],
  );
  const submitListing = useCallback(
    (finished: ListingDraft) =>
      submit ? submit(finished) : addListing(finished, profile.slug),
    [submit, addListing, profile.slug],
  );
  const { send } = useListingWizardSubmit({
    submit: submitListing,
    setPhase,
    setListing,
    clearDraft,
    routeSubmitError,
    setServerError,
    scrollUp,
  });

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
    await send(draft);
  };

  // Both exits land on the directory by default: cancelling from step 0 and
  // finishing after a withdrawal.
  const goToDirectory = useCallback(
    () => void navigate(routes.directory),
    [navigate],
  );
  const leaveWizard = onCancel ?? goToDirectory;
  const finishWizard = onDone ?? goToDirectory;
  const back = () => {
    if (step === 0) leaveWizard();
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
    finishWizard();
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
            {/* "Save and finish later" persists through the same autosave
                layer, so with autosave off the save can only fail. Offer it
                only while there is somewhere for it to write. */}
            <WizardFormChrome
              serverError={serverError}
              onDismissError={() => setServerError(null)}
              isSaveLaterVisible={isAutosaveOn && draft.path !== ""}
              onSaveLater={() => void saveAndFinishLater()}
              isSavingLater={savingLater}
            />
            <WizardFormPane
              form={form}
              step={step}
              savedAt={savedAt}
              userName={resolvedUserName}
              userInitials={resolvedUserInitials}
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
            {renderSuccess ? (
              renderSuccess(listing)
            ) : (
              <ListBusinessSuccess
                listing={listing}
                onEdit={editSubmission}
                onWithdraw={withdraw}
                onAnother={listAnother}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
