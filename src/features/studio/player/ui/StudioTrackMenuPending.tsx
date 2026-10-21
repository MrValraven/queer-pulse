import { useEffect, useRef } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { studioErrorMessageKeyOf } from "../../studioErrors.data";

/** A context menu asked for while its track is still being read. A scroll
 *  or a press anywhere drops the ask, so a menu never opens late under a
 *  finger that moved on. A failed read drops it too and says why; with no
 *  Studio access there is nothing to read, so it drops quietly. */
export function StudioTrackMenuPending({
  error,
  isUnreadable,
  onDismiss,
}: {
  error: unknown;
  isUnreadable: boolean;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });
  const hasError = error !== null && error !== undefined;
  useEffect(() => {
    if (!hasError) return;
    showToast(t(studioErrorMessageKeyOf(error, "load")), "error");
    onDismissRef.current();
  }, [hasError, error, showToast, t]);
  useEffect(() => {
    if (isUnreadable) onDismissRef.current();
  }, [isUnreadable]);
  useEffect(() => {
    const dismiss = () => onDismissRef.current();
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("pointerdown", dismiss, true);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("pointerdown", dismiss, true);
    };
  }, []);
  return null;
}
