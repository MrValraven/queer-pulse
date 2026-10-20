import { useEffect, useRef, type ReactNode } from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./CreatorDraftPreviews.module.css";

/** Every control a staff preview could act through. Links count too: a
 *  preview never takes staff away from the admin page. */
export const CREATOR_DRAFT_PREVIEW_ACTION_SELECTOR =
  "a[href], button, [role='button'], input[type='submit'], input[type='button']";

/** Controls the browser turns a key press into a click for, so the click
 *  listener answers them and the key listener leaves them be. */
const NATIVE_CONTROL_SELECTOR = "a[href], button, input";

const ACTIVATION_KEYS = new Set(["Enter", " "]);

/** `MouseEvent.button` for the middle (wheel) button. */
const MIDDLE_BUTTON = 1;

/**
 * The one frame every staff preview of a creator draft renders inside. The
 * public renderers keep their links, buttons and forms, and here each of
 * them answers with a "This is a preview" toast and that alone: the page
 * stays where it is and sends nothing. It mirrors the capture-phase blocker
 * of `GatheringPreviewProvider`, with links included and middle clicks
 * stopped as well.
 *
 * The content stays in the accessibility tree and in the tab order (the
 * `inert` attribute stays off), so staff can read the whole draft with a
 * screen reader.
 */
export function CreatorDraftPreviewFrame({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const frameRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const sayItIsAPreview = () =>
      showToast(t("admin:creatorDrafts.preview.inertToast"), "info");
    const actionControlOf = (event: Event): Element | null => {
      if (!(event.target instanceof Element)) return null;
      const control = event.target.closest(
        CREATOR_DRAFT_PREVIEW_ACTION_SELECTOR,
      );
      return control && frame.contains(control) ? control : null;
    };
    const stopAction = (event: Event) => {
      if (!actionControlOf(event)) return;
      event.preventDefault();
      event.stopPropagation();
      sayItIsAPreview();
    };
    // A middle click opens a link in a new tab. A right click opens the
    // context menu, which acts on nothing, so it gets no toast.
    const stopMiddleClick = (event: MouseEvent) => {
      if (event.button === MIDDLE_BUTTON) stopAction(event);
    };
    // A custom `role="button"` may act on the key itself, so its Enter and
    // Space stop here. Native controls turn those keys into the click above.
    const stopKeyboardAction = (event: KeyboardEvent) => {
      if (!ACTIVATION_KEYS.has(event.key)) return;
      const control = actionControlOf(event);
      if (!control || control.matches(NATIVE_CONTROL_SELECTOR)) return;
      event.preventDefault();
      event.stopPropagation();
      sayItIsAPreview();
    };
    // A submit button's click was stopped above, which cancels the
    // submission, so one press is one toast. This catches any other way in.
    const stopSubmit = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      sayItIsAPreview();
    };
    frame.addEventListener("click", stopAction, true);
    frame.addEventListener("auxclick", stopMiddleClick, true);
    frame.addEventListener("keydown", stopKeyboardAction, true);
    frame.addEventListener("submit", stopSubmit, true);
    return () => {
      frame.removeEventListener("click", stopAction, true);
      frame.removeEventListener("auxclick", stopMiddleClick, true);
      frame.removeEventListener("keydown", stopKeyboardAction, true);
      frame.removeEventListener("submit", stopSubmit, true);
    };
  }, [showToast, t]);

  return (
    <section ref={frameRef} aria-label={label} className={styles.frame}>
      {children}
    </section>
  );
}
