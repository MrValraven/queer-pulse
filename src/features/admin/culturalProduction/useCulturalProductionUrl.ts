import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  isCulturalAssignedToFilter,
  isCulturalEventType,
  isCulturalIdeaStatus,
  isCulturalTaskStatus,
  type CulturalAssignedToFilter,
  type CulturalEventType,
  type CulturalIdeaStatus,
  type CulturalTaskFilters,
} from "./api/culturalProduction.types";
import {
  CULTURAL_PRODUCTION_PARAM,
  type CulturalProductionTab,
} from "./culturalProductionPaths";
import {
  ALL_TASK_STATUSES_PARAM_VALUE,
  CULTURAL_DRAWER_PUSHED_STATE_KEY,
  CULTURAL_PRODUCTION_TABS,
  DEFAULT_CULTURAL_PRODUCTION_TAB,
  DEFAULT_CULTURAL_TASK_STATUS_VIEW,
  type CulturalTaskStatusView,
} from "./culturalProductionUrl.data";

export interface CulturalProductionUrl {
  tab: CulturalProductionTab;
  setTab(tab: CulturalProductionTab): void;
  openIdeaId: string | null;
  openIdea(ideaId: string): void;
  closeIdea(): void;
  openTaskId: string | null;
  openTask(taskId: string): void;
  closeTask(): void;
  /** The wire filters: a status absent in the URL is "open"; "all" is null. */
  taskFilters: CulturalTaskFilters;
  /** The task status control's value. */
  taskStatusView: CulturalTaskStatusView;
  setAssignedTo(next: CulturalAssignedToFilter | null): void;
  setTaskStatusView(next: CulturalTaskStatusView): void;
  hasTaskFilters: boolean;
  clearTaskFilters(): void;
  ideaStatus: CulturalIdeaStatus | null;
  eventType: CulturalEventType | null;
  setIdeaStatus(next: CulturalIdeaStatus | null): void;
  setEventType(next: CulturalEventType | null): void;
  hasIdeaFilters: boolean;
  clearIdeaFilters(): void;
}

type ParamChanges = Partial<
  Record<
    (typeof CULTURAL_PRODUCTION_PARAM)[keyof typeof CULTURAL_PRODUCTION_PARAM],
    string | null
  >
>;

/** A copy of `params` with each change set, or removed when null. */
function withParams(
  params: URLSearchParams,
  changes: ParamChanges,
): URLSearchParams {
  const nextParams = new URLSearchParams(params);
  Object.entries(changes).forEach(([name, value]) => {
    if (value === null || value === undefined || value === "")
      nextParams.delete(name);
    else nextParams.set(name, value);
  });
  return nextParams;
}

function tabOf(value: string | null): CulturalProductionTab {
  return (
    CULTURAL_PRODUCTION_TABS.find((tab) => tab === value) ??
    DEFAULT_CULTURAL_PRODUCTION_TAB
  );
}

function taskStatusViewOf(value: string | null): CulturalTaskStatusView {
  if (value === ALL_TASK_STATUSES_PARAM_VALUE) return "all";
  if (isCulturalTaskStatus(value)) return value;
  return DEFAULT_CULTURAL_TASK_STATUS_VIEW;
}

/** Whether the history entry is one a drawer open pushed. */
function isDrawerPushedEntry(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[CULTURAL_DRAWER_PUSHED_STATE_KEY] ===
      true
  );
}

function idOf(value: string | null): string | null {
  return value === null || value === "" ? null : value;
}

/**
 * The Cultural Production page state, kept in the URL (contract 10.1) so a
 * link lands on the same view: `tab`, the open idea or task drawer, the task
 * filters and the idea filters. Filter writes replace the history entry
 * (keeping its state); a tab change pushes one. Opening a drawer pushes an
 * entry marked in `location.state`, so Back closes the drawer, and closing
 * a marked drawer steps back to the entry before it; a drawer that arrived
 * on a link closes by a replace. Unknown values read as the defaults: the
 * Ideas tab, Everyone and the Open view.
 */
export function useCulturalProductionUrl(): CulturalProductionUrl {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const param = (name: string) => searchParams.get(name);

  const tab = tabOf(param(CULTURAL_PRODUCTION_PARAM.tab));
  const openIdeaId = idOf(param(CULTURAL_PRODUCTION_PARAM.idea));
  const openTaskId = idOf(param(CULTURAL_PRODUCTION_PARAM.task));
  const assignedToParam = param(CULTURAL_PRODUCTION_PARAM.assignedTo);
  const assignedTo = isCulturalAssignedToFilter(assignedToParam)
    ? assignedToParam
    : null;
  const taskStatusView = taskStatusViewOf(
    param(CULTURAL_PRODUCTION_PARAM.status),
  );
  const ideaStatusParam = param(CULTURAL_PRODUCTION_PARAM.ideaStatus);
  const ideaStatus = isCulturalIdeaStatus(ideaStatusParam)
    ? ideaStatusParam
    : null;
  const eventTypeParam = param(CULTURAL_PRODUCTION_PARAM.eventType);
  const eventType = isCulturalEventType(eventTypeParam) ? eventTypeParam : null;

  // A replace keeps the entry's state, so a filter change under an open
  // drawer keeps its mark; a plain push starts an unmarked entry.
  const write = (changes: ParamChanges, shouldReplace: boolean) => {
    setSearchParams((previousParams) => withParams(previousParams, changes), {
      replace: shouldReplace,
      state: shouldReplace ? (location.state as unknown) : null,
    });
  };

  const openDrawer = (changes: ParamChanges) => {
    setSearchParams((previousParams) => withParams(previousParams, changes), {
      state: { [CULTURAL_DRAWER_PUSHED_STATE_KEY]: true },
    });
  };

  const closeDrawer = (changes: ParamChanges) => {
    if (isDrawerPushedEntry(location.state)) void navigate(-1);
    else write(changes, true);
  };

  return {
    tab,
    setTab: (nextTab) =>
      write(
        {
          [CULTURAL_PRODUCTION_PARAM.tab]:
            nextTab === DEFAULT_CULTURAL_PRODUCTION_TAB ? null : nextTab,
        },
        false,
      ),
    openIdeaId,
    openIdea: (ideaId) =>
      openDrawer({ [CULTURAL_PRODUCTION_PARAM.idea]: ideaId }),
    closeIdea: () => closeDrawer({ [CULTURAL_PRODUCTION_PARAM.idea]: null }),
    openTaskId,
    openTask: (taskId) =>
      openDrawer({ [CULTURAL_PRODUCTION_PARAM.task]: taskId }),
    closeTask: () => closeDrawer({ [CULTURAL_PRODUCTION_PARAM.task]: null }),
    taskFilters: {
      assignedTo,
      status: taskStatusView === "all" ? null : taskStatusView,
    },
    taskStatusView,
    setAssignedTo: (next) =>
      write({ [CULTURAL_PRODUCTION_PARAM.assignedTo]: next }, true),
    setTaskStatusView: (next) =>
      write(
        {
          [CULTURAL_PRODUCTION_PARAM.status]:
            next === DEFAULT_CULTURAL_TASK_STATUS_VIEW ? null : next,
        },
        true,
      ),
    hasTaskFilters:
      assignedTo !== null ||
      taskStatusView !== DEFAULT_CULTURAL_TASK_STATUS_VIEW,
    clearTaskFilters: () =>
      write(
        {
          [CULTURAL_PRODUCTION_PARAM.assignedTo]: null,
          [CULTURAL_PRODUCTION_PARAM.status]: null,
        },
        true,
      ),
    ideaStatus,
    eventType,
    setIdeaStatus: (next) =>
      write({ [CULTURAL_PRODUCTION_PARAM.ideaStatus]: next }, true),
    setEventType: (next) =>
      write({ [CULTURAL_PRODUCTION_PARAM.eventType]: next }, true),
    hasIdeaFilters: ideaStatus !== null || eventType !== null,
    clearIdeaFilters: () =>
      write(
        {
          [CULTURAL_PRODUCTION_PARAM.ideaStatus]: null,
          [CULTURAL_PRODUCTION_PARAM.eventType]: null,
        },
        true,
      ),
  };
}
