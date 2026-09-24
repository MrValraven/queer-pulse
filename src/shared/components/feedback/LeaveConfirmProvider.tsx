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
import {
  LeaveConfirmContext,
  type LeaveRequestOptions,
} from "./leaveConfirmContext";

/** The open request: the dialog body plus the caller's optional save. */
interface PendingLeaveRequest extends LeaveRequestOptions {
  message: string;
}

/**
 * App-wide "leave without saving?" dialog, the QueerPulse replacement for the
 * browser's `window.confirm`. `requestLeave(message, options)` opens the shared
 * `ConfirmDialog` and hands back a promise of the visitor's choice, so a
 * navigation guard can await it the same way it used to read `confirm()`.
 *
 * A caller that can save passes `onSaveAndLeave`, and the dialog grows a third
 * "Save and leave" action. Clicking it disables every button while the save
 * runs, then leaves when the save succeeded or closes the dialog when it
 * failed, so the visitor stays on the page and sees the editor's own error.
 *
 * Only one request is live at a time. Its resolver lives in a ref and is
 * cleared before it is called, so each promise settles exactly once whichever
 * path gets there first (a button, Escape, a newer request, or unmount). A
 * save that finishes after its request was superseded or dismissed resolves
 * nothing: the newer request keeps its own answer.
 */
export function LeaveConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [pendingRequest, setPendingRequest] =
    useState<PendingLeaveRequest | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const resolverRef = useRef<((shouldLeave: boolean) => void) | null>(null);

  // Hands the outcome to the current request, if any, and forgets it.
  const settlePending = useCallback((shouldLeave: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    resolver?.(shouldLeave);
  }, []);

  const requestLeave = useCallback(
    (message: string, options?: LeaveRequestOptions) => {
      // A newer request supersedes the open one: the older caller stays put.
      settlePending(false);
      setIsSaving(false);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setPendingRequest({
          message,
          onSaveAndLeave: options?.onSaveAndLeave,
        });
      });
    },
    [settlePending],
  );

  const closeWith = useCallback(
    (shouldLeave: boolean) => {
      settlePending(shouldLeave);
      setIsSaving(false);
      setPendingRequest(null);
    },
    [settlePending],
  );

  const dismissLeave = useCallback(() => closeWith(false), [closeWith]);
  const confirmLeave = useCallback(() => closeWith(true), [closeWith]);

  const onSaveAndLeave = pendingRequest?.onSaveAndLeave;
  const saveAndLeave = useCallback(async () => {
    // The request this click belongs to, compared again once the save lands.
    const resolver = resolverRef.current;
    if (!onSaveAndLeave || !resolver) return;
    setIsSaving(true);
    let didSave: boolean;
    try {
      didSave = await onSaveAndLeave();
    } catch {
      didSave = false;
    }
    // A newer request or a dismiss arrived mid-save and already reset the
    // saving flag: this save has no answer left to give.
    if (resolverRef.current !== resolver) return;
    closeWith(didSave);
  }, [onSaveAndLeave, closeWith]);

  // A request still open when the provider goes away counts as "stay", so
  // no caller is left awaiting a promise that can never settle.
  useEffect(() => () => settlePending(false), [settlePending]);

  const value = useMemo(
    () => ({ requestLeave, dismissLeave }),
    [requestLeave, dismissLeave],
  );
  const isOpen = pendingRequest !== null;

  return (
    <LeaveConfirmContext.Provider value={value}>
      {children}
      {isOpen && (
        <ConfirmDialog
          open={isOpen}
          onClose={dismissLeave}
          onConfirm={confirmLeave}
          title={t("shared:leaveConfirm.title")}
          description={pendingRequest.message}
          confirmLabel={t("shared:leaveConfirm.leave")}
          cancelLabel={t("shared:leaveConfirm.stay")}
          tone="destructive"
          initialFocus="cancel"
          loading={isSaving}
          extraAction={
            onSaveAndLeave
              ? {
                  label: t("shared:leaveConfirm.saveAndLeave"),
                  onClick: () => void saveAndLeave(),
                }
              : undefined
          }
        />
      )}
    </LeaveConfirmContext.Provider>
  );
}
