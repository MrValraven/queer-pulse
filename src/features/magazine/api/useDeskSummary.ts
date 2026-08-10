import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getDeskSummary } from "./pieces.api";
import type { DeskSummaryDto } from "./pieces.api";
import { STAGE_VIEW_TO_DTO } from "./pieces.adapters";
import { DEMO_ACTIVITY, DEMO_EDITORS, DEMO_PIECES, DEMO_STAGES } from "../data/desk.data";

function buildDemoSummary(): DeskSummaryDto {
  const stageLoad = DEMO_STAGES.map((stage) => ({
    stage: STAGE_VIEW_TO_DTO[stage],
    count: DEMO_PIECES.filter((piece) => piece.stage === stage).length,
  }));

  const editorLoad = DEMO_EDITORS.map((editor) => ({
    editorId: editor.id,
    count: DEMO_PIECES.filter((piece) => piece.editorId === editor.id).length,
    cap: editor.cap,
  }));

  const activity = DEMO_ACTIVITY.map((activityEntry) => ({
    actorId: activityEntry.who,
    action: activityEntry.what,
    detail: "",
    createdAt: activityEntry.when,
  }));

  return { stageLoad, editorLoad, activity };
}

/**
 * Editor desk's sidebar summary (stage load, editor load, activity feed).
 * Demo mode derives it from the static mock; live mode calls
 * `GET /magazine/admin/desk-summary`.
 */
export function useDeskSummary() {
  const { demoMode } = useDemoMode();
  const query = useQuery<DeskSummaryDto>({
    queryKey: ["magazine-desk-summary", demoMode],
    queryFn: () => (demoMode ? Promise.resolve(buildDemoSummary()) : getDeskSummary()),
  });

  return { summary: query.data, isLoading: query.isLoading, isError: query.isError };
}
