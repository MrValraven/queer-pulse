import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useTranslation } from "../../i18n/useTranslation";
import { LeaveConfirmContext } from "./leaveConfirmContext";

/**
 * App-wide "leave without saving?" dialog, the QueerPulse replacement for the
 * browser's `window.confirm`. `requestLeave(message)` opens the shared
 * `ConfirmDialog` and hands back a promise of the visitor's choice, so a
 * navigation guard can await it the same way it used to read `confirm()`.
 *
 * Only one request is live at a time. Its resolver lives in a ref and is
 * cleared before it is called, so each promise settles exactly once whichever
 * path gets there first (a button, Escape, a newer request, or unmount).
 */
export function LeaveConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const resolverRef = useRef<((shouldLeave: boolean) => void) | null>(null);

  // Hands the outcome to the current request, if any, and forgets it.
  const settlePending = useCallback((shouldLeave: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    resolver?.(shouldLeave);
  }, []);

  const requestLeave = useCallback(
    (message: string) => {
      // A newer request supersedes the open one: the older caller stays put.
      settlePending(false);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setPendingMessage(message);
      });
    },
    [settlePending],
  );

  const closeWith = useCallback(
    (shouldLeave: boolean) => {
      settlePending(shouldLeave);
      setPendingMessage(null);
    },
    [settlePending],
  );

  const dismissLeave = useCallback(() => closeWith(false), [closeWith]);
  const confirmLeave = useCallback(() => closeWith(true), [closeWith]);

  // A request still open when the provider goes away counts as "stay", so
  // no caller is left awaiting a promise that can never settle.
  useEffect(() => () => settlePending(false), [settlePending]);

  const value = useMemo(
    () => ({ requestLeave, dismissLeave }),
    [requestLeave, dismissLeave],
  );
  const isOpen = pendingMessage !== null;

  return (
    <LeaveConfirmContext.Provider value={value}>
      {children}
      {isOpen && (
        <ConfirmDialog
          open={isOpen}
          onClose={dismissLeave}
          onConfirm={confirmLeave}
          title={t("shared:leaveConfirm.title")}
          description={pendingMessage}
          confirmLabel={t("shared:leaveConfirm.leave")}
          cancelLabel={t("shared:leaveConfirm.stay")}
          tone="destructive"
          initialFocus="cancel"
        />
      )}
    </LeaveConfirmContext.Provider>
  );
}
