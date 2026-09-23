import type { TFunction } from "../../shared/i18n/types";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import { gatheringPath, type GatheringDetail } from "./data";

/**
 * Share a gathering's detail page: hand off to the native share sheet where
 * available (mobile browsers), falling back to copy-link + toast. Modelled on
 * `shareSubprofile` so both share controls in the app behave the same way.
 *
 * The link is built from the canonical `gatheringPath`, whatever route param
 * the member arrived on, so every shared copy points at the same address.
 */
export async function shareGathering(
  gathering: Pick<GatheringDetail, "slug" | "title">,
  t: TFunction,
  showToast: ToastContextValue["showToast"],
): Promise<void> {
  const url = window.location.origin + gatheringPath(gathering.slug);

  if (navigator.share) {
    try {
      await navigator.share({ title: gathering.title, url });
    } catch (error) {
      // A user-cancelled share sheet rejects with AbortError. The native UI
      // already communicated that, so there is nothing more to show.
      if (error instanceof Error && error.name === "AbortError") return;
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(url);
    showToast(t("gatherings:headerToolbar.shareCopiedToast"), "success");
  } catch {
    // Denied permission, a non-secure context or an embedded webview. Say so
    // and hand over the URL itself, so the control still gets the member the
    // link it promised.
    showToast(
      t("gatherings:headerToolbar.shareCopyFailedToast", { url }),
      "error",
    );
  }
}
