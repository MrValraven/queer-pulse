import { useEffect, useRef, type ReactNode } from "react";
import { FiClock } from "react-icons/fi";
import { EmptyState, SuccessPanel } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./GoTogetherFeedback.module.css";

interface ArrivalRegionProps {
  /** Accessible name read out when focus lands here. */
  label: string;
  /** True only when this view replaced the form because of the member's own
   *  action (a Save). A view that is simply the first paint keeps focus
   *  where the browser put it. */
  shouldTakeFocus: boolean;
  children: ReactNode;
}

/**
 * Wraps a view that swaps in for the form after Save. The Save button that
 * held focus unmounts and the page gets much shorter, so without this the
 * confirmation lands half under the floating navbar and focus drops to
 * `<body>` with nothing announced. On arrival it scrolls to the top and moves
 * focus here, which names the outcome for screen readers.
 */
function ArrivalRegion({
  label,
  shouldTakeFocus,
  children,
}: ArrivalRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldTakeFocus) return;
    // "instant": the global `scroll-behavior: smooth` would otherwise animate
    // the jump while focus has already moved.
    window.scrollTo({ top: 0, behavior: "instant" });
    regionRef.current?.focus({ preventScroll: true });
  }, [shouldTakeFocus]);

  return (
    <div
      ref={regionRef}
      role="group"
      aria-label={label}
      tabIndex={-1}
      className={styles.arrival}
    >
      {children}
    </div>
  );
}

interface FeedbackSavedPanelProps {
  backLabel: string;
  onBack: () => void;
}

/** The plum "Thanks for telling us" confirmation shown after a save. */
export function FeedbackSavedPanel({
  backLabel,
  onBack,
}: FeedbackSavedPanelProps) {
  const { t } = useTranslation();
  const title = t("goTogether:feedback.confirmation.title");
  const titleEmphasis = t("goTogether:feedback.confirmation.titleEm");

  return (
    <ArrivalRegion label={`${title} ${titleEmphasis}`} shouldTakeFocus>
      <SuccessPanel
        title={title}
        em={titleEmphasis}
        onClose={onBack}
        closeLabel={backLabel}
      >
        {t("goTogether:feedback.confirmation.body")}
      </SuccessPanel>
    </ArrivalRegion>
  );
}

interface FeedbackClosedViewProps {
  backLabel: string;
  backHref: string;
  /** True when the window closed between load and Save, so this view is
   *  the answer to the member's own tap and takes focus. */
  shouldTakeFocus: boolean;
}

/** The calm "this round has closed" view. Also covers a group that no longer
 *  exists for this member (the backend answers 404), since a Retry there could
 *  never succeed. */
export function FeedbackClosedView({
  backLabel,
  backHref,
  shouldTakeFocus,
}: FeedbackClosedViewProps) {
  const { t } = useTranslation();
  const title = t("goTogether:feedback.closed.title");

  return (
    <ArrivalRegion label={title} shouldTakeFocus={shouldTakeFocus}>
      <EmptyState
        icon={<FiClock />}
        title={title}
        description={t("goTogether:feedback.closed.body")}
        action={{ label: backLabel, to: backHref }}
      />
    </ArrivalRegion>
  );
}
