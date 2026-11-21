import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { FiX } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDismissSetupChecklist } from "./api/useDismissSetupChecklist";
import { communityErrorText } from "./communityErrors";
import type { SetupChecklistView } from "./communitySetupChecklist.model";
import type { EditCommunityFocusField } from "./editCommunityFocusField";
import { CommunitySetupChecklistItem } from "./CommunitySetupChecklistItem";
import styles from "./CommunitySetupChecklist.module.css";

interface CommunitySetupChecklistProps {
  slug: string;
  communityName: string;
  /** The derived checklist, or null when the card stays hidden. */
  view: SetupChecklistView | null;
  onOpenEditAt: (field: EditCommunityFocusField) => void;
  /** A focusable element that follows the card on the page (tabIndex -1).
   *  Dismiss checklist moves focus there before the card folds away. */
  focusAfterDismissRef: RefObject<HTMLElement | null>;
}

/**
 * The setup checklist a steward sees on a new community. It folds in when
 * the view arrives and folds away when the view turns null (every item done,
 * or the checklist dismissed). The last view is kept so the card still has
 * its content while it folds away.
 *
 * The dismissal and its toasts live here in the shell, which stays mounted
 * while the card folds away. A live dismissal hides the card at once, and
 * TanStack Query only calls the per-call callbacks while the caller is still
 * mounted, so a card that owned them would drop the toast for any request
 * slower than the fold.
 *
 * The focused Dismiss button goes inert and unmounts with the fold, so focus
 * moves ahead to `focusAfterDismissRef` first. When the dismissal fails and
 * the card comes back, focus returns to its Dismiss button, unless the
 * steward has moved on to something else meanwhile.
 */
export function CommunitySetupChecklist({
  slug,
  communityName,
  view,
  onOpenEditAt,
  focusAfterDismissRef,
}: CommunitySetupChecklistProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const dismissal = useDismissSetupChecklist();
  const [lastView, setLastView] = useState<SetupChecklistView | null>(view);
  // Set during render so the card never paints a frame behind the prop.
  if (view !== null && view !== lastView) setLastView(view);
  const shownView = view ?? lastView;
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const isDismissRefocusPendingRef = useRef(false);
  // Bumped on a failed dismissal so the effect below runs even when the
  // restored view reached this shell before the error callback did.
  const [refocusRequest, setRefocusRequest] = useState(0);

  useEffect(() => {
    if (!isDismissRefocusPendingRef.current || view === null) return;
    isDismissRefocusPendingRef.current = false;
    const activeElement = document.activeElement;
    const isFocusStillHandedOff =
      activeElement === null ||
      activeElement === document.body ||
      activeElement === focusAfterDismissRef.current;
    if (isFocusStillHandedOff) dismissButtonRef.current?.focus();
  }, [refocusRequest, view, focusAfterDismissRef]);

  const dismiss = () => {
    focusAfterDismissRef.current?.focus({ preventScroll: true });
    dismissal.mutate(
      { slug },
      {
        onSuccess: () =>
          showToast(
            t("communities:detail.setupChecklist.dismissedToast"),
            "success",
          ),
        onError: (error) => {
          showToast(communityErrorText(t, error), "error");
          isDismissRefocusPendingRef.current = true;
          setRefocusRequest((request) => request + 1);
        },
      },
    );
  };

  return (
    <Collapse isOpen={view !== null}>
      {shownView && (
        <CommunitySetupChecklistCard
          communityName={communityName}
          view={shownView}
          onOpenEditAt={onOpenEditAt}
          onDismiss={dismiss}
          isDismissing={dismissal.isPending}
          dismissButtonRef={dismissButtonRef}
        />
      )}
    </Collapse>
  );
}

function CommunitySetupChecklistCard({
  communityName,
  view,
  onOpenEditAt,
  onDismiss,
  isDismissing,
  dismissButtonRef,
}: {
  communityName: string;
  view: SetupChecklistView;
  onOpenEditAt: (field: EditCommunityFocusField) => void;
  onDismiss: () => void;
  isDismissing: boolean;
  dismissButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2 className={styles.title} id={headingId}>
            {t("communities:detail.setupChecklist.title", {
              name: communityName,
            })}
          </h2>
          <p className={styles.lead}>
            {t("communities:detail.setupChecklist.lead")}
          </p>
        </div>
        <p className={styles.progress}>
          {t("communities:detail.setupChecklist.progress", {
            done: view.doneCount,
            total: view.totalCount,
          })}
        </p>
      </div>

      <ul className={styles.list}>
        {view.items.map((item) => (
          <CommunitySetupChecklistItem
            key={item.id}
            item={item}
            onOpenEditAt={onOpenEditAt}
          />
        ))}
      </ul>

      <div className={styles.actions}>
        <Button
          ref={dismissButtonRef}
          variant="ghost"
          size="sm"
          className={styles.dismiss}
          onClick={onDismiss}
          disabled={isDismissing}
        >
          <FiX aria-hidden /> {t("communities:detail.setupChecklist.dismiss")}
        </Button>
      </div>
    </section>
  );
}
