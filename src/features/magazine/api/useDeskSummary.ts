import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat, type Formatters } from "../../../shared/i18n/format";
import { formatRelative } from "../../../shared/lib/date";
import { getDeskSummary } from "./pieces.api";
import type { DeskSummaryDto, PieceEventEntryDto } from "./pieces.api";
import { STAGE_VIEW_TO_DTO } from "./pieces.adapters";
import {
  DEMO_ACTIVITY,
  DEMO_EDITORS,
  DEMO_PIECES,
  DEMO_STAGES,
} from "../data/desk.data";

/**
 * Canonical activity row the sidebar renders, shared by demo and live so the
 * component never branches on `demoMode`. `who` and `what` arrive already
 * resolved (a name and a human phrase naming the piece by its title — never a
 * uuid or an `action` enum), and `when` is a ready-to-render display string:
 * demo ships one already ("18m"), live's ISO timestamp goes through the
 * shared `formatRelative` helper. Mirrors `DeskNotificationView`.
 */
export interface DeskActivityView {
  id: string;
  /** Matches the editor directory for the row's avatar; `null` in demo. */
  actorId: string | null;
  who: string;
  what: string;
  when: string;
}

export interface DeskSummaryView {
  stageLoad: DeskSummaryDto["stageLoad"];
  editorLoad: DeskSummaryDto["editorLoad"];
  activity: DeskActivityView[];
}

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

  // The demo fixture is already written as who/what/when display copy, so it
  // maps straight across — `when` ("18m") is left alone below rather than run
  // through `formatRelative`, which only understands an ISO timestamp.
  const activity = DEMO_ACTIVITY.map((activityEntry, index) => ({
    id: `demo-activity-${index}`,
    actorId: null,
    isSystem: false,
    who: activityEntry.who,
    what: activityEntry.what,
    when: activityEntry.when,
  }));

  return { stageLoad, editorLoad, activity };
}

function toActivityView(
  entry: PieceEventEntryDto,
  formatters: Formatters,
  isDemo: boolean,
): DeskActivityView {
  return {
    id: entry.id,
    actorId: entry.actorId,
    who: entry.who,
    what: entry.what,
    when: isDemo
      ? entry.when
      : formatRelative(entry.when, formatters) || entry.when,
  };
}

/**
 * Editor desk's sidebar summary (stage load, editor load, activity feed).
 * Demo mode derives it from the static mock; live mode calls
 * `GET /magazine/admin/desk-summary`. The view mapping runs outside the query
 * function (using the current `useFormat()` formatters) so a language switch
 * re-renders "when" immediately instead of waiting on a cache invalidation.
 */
export function useDeskSummary() {
  const { demoMode } = useDemoMode();
  const formatters = useFormat();
  const query = useQuery<DeskSummaryDto>({
    queryKey: ["magazine-desk-summary", demoMode],
    queryFn: () =>
      demoMode ? Promise.resolve(buildDemoSummary()) : getDeskSummary(),
  });

  const summary: DeskSummaryView | undefined = query.data && {
    stageLoad: query.data.stageLoad,
    editorLoad: query.data.editorLoad,
    activity: query.data.activity.map((entry) =>
      toActivityView(entry, formatters, demoMode),
    ),
  };

  return { summary, isLoading: query.isLoading, isError: query.isError };
}
