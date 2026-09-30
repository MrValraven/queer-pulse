import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { ErrorBoundary } from "../../shared/components/feedback/ErrorBoundary";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Reports the failure once the failed render has committed. The ref keeps it
 * to one report per failure: StrictMode replays mount effects in dev, which
 * would otherwise show two toasts and retry twice.
 */
function ReportModalFailure({ onFailure }: { onFailure: () => void }) {
  const hasReportedRef = useRef(false);
  useEffect(() => {
    if (hasReportedRef.current) return;
    hasReportedRef.current = true;
    onFailure();
  }, [onFailure]);
  return null;
}

interface ModalLoadBoundaryProps {
  children: ReactNode;
  /** Close the modal and let the next open retry the load (see
   *  `LazyModal.retryAfterFailure`). */
  onFailure: () => void;
}

/**
 * Holds a provider-mounted lazy modal (see `lazyModal`). While its chunk loads
 * nothing renders, and if the load fails (offline inside the stale-chunk
 * cooldown, a broken chunk) or the modal throws, the member stays on the page:
 * the modal closes and the shared error toast says it could not load. Without
 * this the error would climb to the app-level boundary and blank the app.
 */
export function ModalLoadBoundary({
  children,
  onFailure,
}: ModalLoadBoundaryProps) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const handleFailure = useCallback(() => {
    showToast(t("common:error.description"), "error");
    onFailure();
  }, [showToast, t, onFailure]);

  return (
    <ErrorBoundary
      level="route"
      fallback={() => <ReportModalFailure onFailure={handleFailure} />}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </ErrorBoundary>
  );
}
