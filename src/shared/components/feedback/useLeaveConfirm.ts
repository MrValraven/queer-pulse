import { useContext } from "react";
import {
  LeaveConfirmContext,
  type LeaveConfirmContextValue,
} from "./leaveConfirmContext";

/**
 * Used when no `LeaveConfirmProvider` sits above the caller (unit tests,
 * isolated renders): the browser's own confirm prompt keeps the guard working.
 * A module-level constant, so hooks that list it in their deps never re-run.
 */
const NATIVE_LEAVE_CONFIRM: LeaveConfirmContextValue = {
  requestLeave: (message) => Promise.resolve(window.confirm(message)),
  dismissLeave: () => {},
};

export function useLeaveConfirm(): LeaveConfirmContextValue {
  return useContext(LeaveConfirmContext) ?? NATIVE_LEAVE_CONFIRM;
}
