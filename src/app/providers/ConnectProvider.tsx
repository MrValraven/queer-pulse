import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ConnectContext } from "./useConnect";
import { lazyModal } from "./lazyModal";
import { ModalLoadBoundary } from "./ModalLoadBoundary";

// Code-split, warmed at idle: the modal's demo fallback reads the whole member
// registry, which would otherwise ride along in first paint.
const connectModal = lazyModal(() =>
  import("../../features/connect/ConnectModal").then(
    (module) => module.ConnectModal,
  ),
);

export function ConnectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    slug?: string;
    reason?: string;
  }>({ open: false });

  const openConnect = useCallback((slug: string, reason?: string) => {
    setState({ open: true, slug, reason });
  }, []);
  const close = useCallback(() => {
    setState({ open: false });
  }, []);
  const handleLoadFailure = useCallback(() => {
    connectModal.retryAfterFailure();
    setState({ open: false });
  }, []);

  useEffect(() => {
    connectModal.warmWhenIdle();
  }, []);

  const value = useMemo(() => ({ openConnect }), [openConnect]);

  return (
    <ConnectContext.Provider value={value}>
      {children}
      {state.open && (
        <ModalLoadBoundary onFailure={handleLoadFailure}>
          <connectModal.Component
            slug={state.slug}
            reason={state.reason}
            onClose={close}
          />
        </ModalLoadBoundary>
      )}
    </ConnectContext.Provider>
  );
}
