import { causeErrorKey } from "../../shared/api/causeErrorKey";
import type { ToastMessage } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";

/**
 * The toast a failed intake-form submission shows: one title for every form
 * ("We couldn't send your form") over the specific cause as its detail.
 *
 * Shared by the resources, culture and economy intake modals, which all post
 * through `submitIntake` (`POST /intakes/:kind`) or the resources suggestion
 * endpoint. The backend gives those routes no feature-specific machine code:
 * it answers 400 for an unknown kind or an oversized payload (one status for
 * both, so the shared "details weren't accepted" line covers them), 401 for a
 * member-only kind sent while signed out, 429 past the throttle (8 a minute,
 * 20 an hour) and 5xx for a fault. The shared cause lines already name each,
 * so there are no overrides here.
 */
export function intakeFailureToast(error: unknown, t: TFunction): ToastMessage {
  const cause = causeErrorKey(error);
  return {
    title: t("shared:intake.errorTitle"),
    detail: t(cause.key, cause.values),
  };
}
