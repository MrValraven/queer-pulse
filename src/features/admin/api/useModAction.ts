import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  actOnReport,
  bulkActOnReports,
  type ModActionCode,
  type ModActionInput,
  type ModBulkInput,
} from "./moderation.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface ModActionVars {
  id: string;
  action: ModActionCode;
  reasonCode: ModActionInput["reasonCode"];
  note: string;
  duration?: string;
}

/**
 * A moderator acts on a single report (spec 04). Demo mode is a no-op — the
 * queue UI drops the row locally with its 340ms leave animation, exactly as
 * before. Live mode PATCHes `/mod/reports/:id`; the backend writes the immutable
 * audit entry and fans out the real `mod_action` (reported member) + `report_outcome`
 * (reporter) notifications — that fan-out is backend-driven, never faked here.
 * The queue removes the row optimistically; `invalidateQueries` refetches on
 * settle so a failure rolls the row back to server truth.
 */
export function useModAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, ModActionVars>({
    demoMode,
    demoLatencyMs: 0,
    // useModerationQueue toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: () => undefined,
    live: async ({ id, action, reasonCode, note, duration }) => {
      await actOnReport(id, { action, reasonCode, note, duration });
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });
}

export interface ModBulkVars {
  ids: string[];
  action: ModActionCode;
  reasonCode: ModBulkInput["reasonCode"];
  note?: string;
}

/** Apply one action to many reports (bulk bar). Same demo/live discipline. */
export function useModBulkAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, ModBulkVars>({
    demoMode,
    demoLatencyMs: 0,
    // useModerationQueue toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: () => undefined,
    live: async ({ ids, action, reasonCode, note }) => {
      await bulkActOnReports({ ids, action, reasonCode, note });
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });
}
