import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useDirectoryListingsActions } from "../../../app/providers/useDirectoryListingsActions";
import { useProfileData } from "../../../app/providers/useProfile";
import {
  TOTAL_STEPS,
  firstWizardStep,
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
import {
  useListingWizardSubmit,
  useWizardSaveNow,
} from "./useListingWizardSubmit";
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
  /** The final-step submit button's label. Defaults to the member flow's
   *  "Send it to the team". An admin console editing a listing passes its
   *  own copy (e.g. "Save changes"). */
  submitLabel?: string;
  /** Whether the sending phase is an edit save rather than a new
   *  submission. Defaults to false, the member behaviour, which renders
   *  `SendingPanel`'s create copy. True renders `<SendingPanel isEdit />`. */
  isEditSave?: boolean;
  /** Whether step pills ahead of the current step are reachable. Defaults to
   *  false, the member behaviour, where only visited pills jump. An admin
   *  console editing a listing that already exists passes true, so every pill
   *  ahead is reachable while each step before it passes its gate. */
  isJumpAheadEnabled?: boolean;
  /** The ref of the listing being edited. Defaults to undefined, a new
   *  submission. An admin console editing an existing listing passes it, so
   *  the duplicate-name check skips the listing itself and the create-only
   *  Path step (0) disappears: no pill, never reachable, and Back on Basics
   *  leaves the wizard through `onCancel` under the "Cancel" label. */
  editRef?: string;
  /** The label of a save button on every step's footer. Defaults to
   *  undefined: no such button, the member behaviour. Set, each step before
   *  the last shows it beside "Next", and the final step's single button uses
   *  it when `submitLabel` is absent. A save jumps to the first step with
   *  missing required fields, or sends when there is none. */
  saveNowLabel?: string;
  /** The line under the live preview. Defaults to the member flow's note
   *  that the listing goes live only after review. */
  previewFootnote?: string;
  /** The toast after a successful send. Undefined shows the member flow's
   *  "with the community team" toast, a string shows that text, and null
   *  shows no toast, for a console whose own success panel already confirms
   *  the save. */
  successToast?: string | null;
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
  submitLabel,
  isEditSave,
  isJumpAheadEnabled,
  editRef,
  saveNowLabel,
  previewFootnote,
  successToast,
}: ListingWizardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addListing, withdrawListing } = useDirectoryListingsActions();
  // The authoring member: real user in live, mock persona in demo (item #3).
  // The read stays unconditional, because hooks cannot be conditional. It is a
  // cheap context read, and a console that supplies its own name, seed and
  // submit ignores the values.
  const { profile } = useProfileData();
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
      },
    [seed, resolvedUserName, profile.bio],
  );
  const form = useListingForm(initialDraft, resolvedSeed);
  const { draft } = form;
  // A draft resumed from the landing list / a `?draft` deep link.
  const isResumed = Boolean(initialDraft);
  const firstStep = firstWizardStep(editRef !== undefined);
  const [storedStep, setStep] = useState(initialStep ?? firstStep);
  // Every path that sets a step (a resume, a 422 routed to its field, the
  // review step's "edit" links) can name step 0, which an edit does not have.
  // Reading through the floor keeps all of them on a real step.
  const step = Math.max(storedStep, firstStep);
  const [phase, setPhase] = useState<Phase>("form");
  const [listing, setListing] = useState<PendingListing | null>(null);
  // An edit opens on the listing's own name, which can look like another
  // directory entry. The duplicate hint waits until that name changes.
  const loadedName = editRef !== undefined ? initialDraft?.name : undefined;

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
    successToast,
  });

  const goToStep = (n: number) => {
    setStep(Math.max(n, firstStep));
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

  // Save from any step: jumps to the first step with gaps and focuses its
  // bar, or sends when there are none.
  const saveNowFlow = useWizardSaveNow({
    firstStep,
    canAdvance: form.canAdvance,
    setStep,
    setServerError,
    send,
  });

  // Both exits land on the directory by default: cancelling from the first
  // step and finishing after a withdrawal.
  const goToDirectory = useCallback(
    () => void navigate(routes.directory),
    [navigate],
  );
  const leaveWizard = onCancel ?? goToDirectory;
  const finishWizard = onDone ?? goToDirectory;
  const back = () => {
    if (step === firstStep) leaveWizard();
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
              submitLabel={submitLabel}
              isJumpAheadEnabled={isJumpAheadEnabled}
              editRef={editRef}
              saveNowLabel={saveNowLabel}
              onSave={() => void saveNowFlow.saveNow(draft)}
              previewFootnote={previewFootnote}
              isNeededBarFocusPending={saveNowFlow.neededBarFocusStep === step}
              onNeededBarFocused={saveNowFlow.clearNeededBarFocus}
              duplicateCheckBaselineName={loadedName}
            />
          </>
        )}

        {phase === "sending" && <SendingPanel isEdit={isEditSave} />}

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
