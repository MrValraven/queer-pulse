import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ConnectModal } from "../../features/connect/ConnectModal";
import { ConnectContext } from "./useConnect";

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
