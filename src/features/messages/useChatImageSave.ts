import { useCallback, useState } from "react";
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
 * Saves a chat photo to the member's device. The bytes are fetched and handed
 * to the shared blob download, because a browser silently ignores the
 * `download` attribute on a cross-origin link, which is exactly what a photo
 * served from object storage is. A refused fetch (no CORS header, offline)
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
