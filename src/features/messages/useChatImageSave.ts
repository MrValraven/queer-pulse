import { useCallback, useState } from "react";
import { API_BASE_URL } from "../../shared/api/config";
import { downloadBlobFile } from "../../shared/lib/downloadBlob";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** `queerpulse-photo-20260914-1432.jpg` */
function savedFileName(mimeType: string): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate(),
  )}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `queerpulse-photo-${stamp}.${EXTENSION_BY_MIME[mimeType] ?? "jpg"}`;
}

/**
 * The `?download=1` form of a live photo URL (`${API_BASE_URL}/files/<key>`),
 * or null for anything else (a demo asset, a `blob:` preview). That route needs
 * the httpOnly session cookie, which a cross-origin `fetch` does not send, and
 * it 302s to the bucket, which serves no CORS headers. A top-level navigation
 * carries the cookie and follows the redirect, and `download=1` makes the
 * backend sign an `attachment` disposition, so the browser saves the file and
 * the page stays put.
 */
function liveDownloadUrl(url: string): string | null {
  if (!API_BASE_URL) return null;
  try {
    const parsed = new URL(url, window.location.href);
    const apiOrigin = new URL(API_BASE_URL, window.location.href).origin;
    if (parsed.origin !== apiOrigin || !parsed.pathname.includes("/files/")) {
      return null;
    }
    parsed.searchParams.set("download", "1");
    return parsed.toString();
  } catch {
    return null;
  }
}

function navigateToDownload(url: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Saves a chat photo to the member's device. A live photo is downloaded by
 * navigating to its `?download=1` URL (see {@link liveDownloadUrl}). Any other
 * URL has its bytes fetched and handed to the shared blob download, because a
 * browser silently ignores the `download` attribute on a cross-origin link. A
 * refused fetch (no CORS header, offline)
 * falls back to opening the image in a new tab, with a toast saying so, so the
 * action is never a dead button. `window.open` can itself be blocked (Safari
 * is strict about popups opened after an `await`), so its return value is
 * checked before the "opened in a new tab" toast is allowed to claim that.
 */
export function useChatImageSave() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveImage = useCallback(
    async (url: string) => {
      const downloadUrl = liveDownloadUrl(url);
      if (downloadUrl) {
        navigateToDownload(downloadUrl);
        showToast(t("messages:viewer.saved"), "success");
        return;
      }
      setIsSaving(true);
      try {
        const response = await fetch(url, { mode: "cors" });
        if (!response.ok) throw new Error(`status ${response.status}`);
        const blob = await response.blob();
        downloadBlobFile(savedFileName(blob.type), blob);
        showToast(t("messages:viewer.saved"), "success");
      } catch {
        const openedTab = window.open(url, "_blank", "noopener,noreferrer");
        if (openedTab) {
          showToast(t("messages:viewer.saveFallback"), "info");
        } else {
          showToast(t("messages:viewer.saveFailed"), "error");
        }
      } finally {
        setIsSaving(false);
      }
    },
    [showToast, t],
  );

  return { saveImage, isSaving };
}
