import type { TFunction } from "../../shared/i18n/types";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import { personaShareUrl } from "./personaLinks.data";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * Share a public persona page: hand off to the native share sheet where
 * available (mobile browsers), falling back to copy-link + toast. Shared by the
 * standalone `SubprofileShare` button (owner row) and the `SubprofileMoreMenu`
 * overflow item (public row), so both entry points share one behaviour.
 */
export async function shareSubprofile(
  view: PublicSubprofileView,
  t: TFunction,
  showToast: ToastContextValue["showToast"],
): Promise<void> {
  const url = personaShareUrl(view);

  if (navigator.share) {
    try {
      await navigator.share({ title: view.displayName, url });
    } catch (error) {
      // A user-cancelled share sheet rejects with AbortError — the native
      // UI already communicated that, so there's nothing more to show.
      if (error instanceof Error && error.name === "AbortError") return;
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    showToast(t("subprofiles:share.copied"), "success");
  } catch {
    // Clipboard permission denied/unavailable — nothing actionable to do.
  }
}
