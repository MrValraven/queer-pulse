import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { GatheringPreviewContext } from "./gatheringPreviewContext";
import { PREVIEW_ALLOW_ATTRIBUTE, type GuestPreviewRole } from "./guestPreview";
import styles from "./GatheringPreviewProvider.module.css";

const GUEST_ACTION_SELECTOR =
  "button, [role='button'], input[type='submit'], input[type='button']";

/**
 * Wraps the gathering page while a host previews it as a guest. Every button
 * inside answers with a "This is a preview" toast and nothing else, and no
 * form inside can submit, so a host can press everything a guest can press
 * without RSVPing to, reporting or messaging anything.
 */
export function GatheringPreviewProvider({
  viewAs,
  children,
}: {
  viewAs: GuestPreviewRole;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const regionRef = useRef<HTMLDivElement>(null);

  const preview = useMemo(
    () => ({
      viewAs,
      runGuestAction: () =>
        showToast(t("gatherings:preview.inertToast"), "info"),
    }),
    [viewAs, showToast, t],
  );

  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    const stopGuestAction = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest(GUEST_ACTION_SELECTOR);
      if (!control || !region.contains(control)) return;
      if (control.closest(`[${PREVIEW_ALLOW_ATTRIBUTE}]`)) return;
      event.preventDefault();
      event.stopPropagation();
      preview.runGuestAction();
    };
    // A blocked submission answers with the same toast. A submit button
    // outside an allowed subtree never gets here (its click was stopped
    // above, which cancels the submission), so one press is one toast.
    const stopSubmit = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      preview.runGuestAction();
    };
    region.addEventListener("click", stopGuestAction, true);
    region.addEventListener("submit", stopSubmit, true);
    return () => {
      region.removeEventListener("click", stopGuestAction, true);
      region.removeEventListener("submit", stopSubmit, true);
    };
  }, [preview]);

  return (
    <GatheringPreviewContext.Provider value={preview}>
      <div ref={regionRef} className={styles.region}>
        {children}
      </div>
    </GatheringPreviewContext.Provider>
  );
}
