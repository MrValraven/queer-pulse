import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ConnectModal } from "../../features/connect/ConnectModal";

interface ConnectContextValue {
  /** Open the Connect modal. Pass a member slug to address it, and a reason to
   *  preselect (`open:<id>` | `custom:<label>` | a generic REASONS id). */
  openConnect: (slug?: string, reason?: string) => void;
}

const ConnectContext = createContext<ConnectContextValue | null>(null);

export function ConnectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    slug?: string;
    reason?: string;
  }>({ open: false });

  const openConnect = useCallback((slug?: string, reason?: string) => {
    setState({ open: true, slug, reason });
  }, []);
  const close = useCallback(() => {
    setState({ open: false });
  }, []);

  const value = useMemo(() => ({ openConnect }), [openConnect]);

  return (
    <ConnectContext.Provider value={value}>
      {children}
      {state.open && (
        <ConnectModal slug={state.slug} reason={state.reason} onClose={close} />
      )}
    </ConnectContext.Provider>
  );
}

export function useConnect() {
  const ctx = useContext(ConnectContext);
  if (!ctx) {
    throw new Error("useConnect must be used within ConnectProvider");
  }
  return ctx;
}
