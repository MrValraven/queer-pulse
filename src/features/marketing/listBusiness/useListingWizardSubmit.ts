import { useCallback, useEffect, useRef } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingDraft, PendingListing } from "./listBusiness.data";

// Floor for the "sending" ring so it's always visible; live mode also waits
// for the real POST round-trip, whichever is longer.
const MIN_SEND_MS = 700;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The wizard's final-step send, lifted out of `ListingWizard` so that
 * component stays under the size limit. The behaviour is the wizard's own,
 * moved across unchanged: race the submit against a minimum spinner time,
 * adopt the created record, clear the autosaved draft, toast, and on failure
 * drop back to the form so `routeSubmitError` can put the member on the step
 * that owns the rejected field.
 *
 * The phase and listing setters are injected. The wizard moves between those
 * states on its own too (`editSubmission` returns to the form with the
 * created listing still held, `listAnother` clears it), so keeping one owner
 * of that state keeps every transition in one place.
 *
 * `submit` is injected so a console that posts through a different endpoint
 * reuses this whole flow. The wizard passes its own directory action.
 */
export function useListingWizardSubmit({
  submit,
  setPhase,
  setListing,
  clearDraft,
  routeSubmitError,
  setServerError,
  scrollUp,
}: {
  /** Persist the finished draft and resolve with the created record. */
  submit: (draft: ListingDraft) => Promise<PendingListing>;
  setPhase: (phase: "form" | "sending" | "success") => void;
  setListing: (listing: PendingListing) => void;
  /** Drop the autosaved draft once the listing exists. */
  clearDraft: () => void;
  /** Route a failed submit to the step that owns the offending field. */
  routeSubmitError: (error: unknown, showGenericError: () => void) => void;
  setServerError: (message: string | null) => void;
  scrollUp: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  // Guard against setState after unmount mid-send. Reset on setup so
  // StrictMode's mount→cleanup→remount doesn't leave the ref stuck at false.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const send = useCallback(
    async (draft: ListingDraft) => {
      setServerError(null);
      setPhase("sending");
      scrollUp();
      try {
        const [created] = await Promise.all([
          submit(draft),
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
    },
    [
      submit,
      setPhase,
      setListing,
      clearDraft,
      routeSubmitError,
      setServerError,
      scrollUp,
      showToast,
      t,
    ],
  );

  return { send };
}
