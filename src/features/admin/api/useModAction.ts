import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  actOnReport,
  bulkActOnReports,
  type ModActionCode,
  type ModActionInput,
  type ModBulkInput,
} from "./moderation.api";

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
  return useMutation<void, Error, ModActionVars>({
    mutationFn: async ({ id, action, reasonCode, note, duration }) => {
      if (demoMode) return;
      await actOnReport(id, { action, reasonCode, note, duration });
    },
    onSettled: () => {
      if (!demoMode)
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
  return useMutation<void, Error, ModBulkVars>({
    mutationFn: async ({ ids, action, reasonCode, note }) => {
      if (demoMode) return;
      await bulkActOnReports({ ids, action, reasonCode, note });
    },
    onSettled: () => {
      if (!demoMode)
        void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });
}
