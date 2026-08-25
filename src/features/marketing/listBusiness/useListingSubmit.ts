import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { TOTAL_STEPS } from "./listBusiness.data";
import { resolveListing422, flashField } from "./listing422";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

/**
 * The wizard's submit-failure + save-later concerns, kept out of `ListingWizard`
 * so that component stays under the size limit.
 *
 * - `routeSubmitError` (item #4): a typed 422 jumps to the step that owns the
 *   first offending field and surfaces the server's message inline there; any
 *   other failure falls back to the review step + the caller's generic toast.
 * - `saveAndFinishLater` (item #11): persist the draft and return to the
 *   directory, honestly reporting a failed save.
 */
export function useListingSubmit({
  setStep,
  saveAndExit,
  flashClass,
}: {
  setStep: Dispatch<SetStateAction<number>>;
  saveAndExit: () => Promise<boolean>;
  /** The page module's field-flash class, forwarded to `flashField`. */
  flashClass?: string;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savingLater, setSavingLater] = useState(false);

  const routeSubmitError = useCallback(
    (error: unknown, showGenericError: () => void) => {
      const target = resolveListing422(error);
      if (target) {
        setStep(target.step);
        setServerError(target.message);
        // Let the step's pane remount (keyed by step) before scrolling to it.
        window.setTimeout(() => flashField(target.anchor, flashClass), 80);
        return;
      }
      setStep(TOTAL_STEPS - 1);
      setServerError(null);
      showGenericError();
      scrollToTop();
    },
    [setStep, flashClass],
  );

  const saveAndFinishLater = useCallback(async () => {
    setSavingLater(true);
    const ok = await saveAndExit();
    setSavingLater(false);
    if (ok) {
      showToast(t("marketing:listBusiness.saveLater.toast"), "success");
      void navigate(routes.directory);
    } else {
      showToast(t("marketing:listBusiness.saveLater.error"), "error");
    }
  }, [saveAndExit, showToast, t, navigate]);

  return {
    serverError,
    setServerError,
    savingLater,
    routeSubmitError,
    saveAndFinishLater,
  };
}
