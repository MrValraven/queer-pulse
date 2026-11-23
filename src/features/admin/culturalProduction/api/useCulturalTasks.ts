import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  getCulturalTask,
  getCulturalTasks,
  shouldRetryCulturalRead,
} from "./culturalProduction.api";
import {
  type CulturalTaskDTO,
  type CulturalTaskFilters,
  type CulturalTaskListDTO,
} from "./culturalProduction.types";
import { culturalKeys } from "./culturalProductionKeys";

const LIVE_STALE_MS = 30_000;

/** The task list for one set of filters, with the todo, doing and done
 *  counts under `assignedTo`. Demo reads the demo store, which only demo
 *  writes change, so it never goes stale there. While a new set of filters
 *  loads, the previous answer stays as placeholder data
 *  (`isPlaceholderData`), so the list keeps its rows on screen and only the
 *  very first read shows the loading view. */
export function useCulturalTasks(
  filters: CulturalTaskFilters,
): UseQueryResult<CulturalTaskListDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<CulturalTaskListDTO, Error>({
    queryKey: culturalKeys.tasks(filters, demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    retry: shouldRetryCulturalRead,
    placeholderData: keepPreviousData,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoListCulturalTasks } =
          await import("../culturalProductionDemoStore");
        return demoListCulturalTasks(filters);
      }
      return getCulturalTasks(filters, signal);
    },
  });
}

/** One task with its notes. A null id sends no request. A refusal that
 *  names a reason (the task is gone) answers at once; any other failure
 *  retries twice. */
export function useCulturalTask(
  taskId: string | null,
): UseQueryResult<CulturalTaskDTO, Error> {
  const { demoMode } = useDemoMode();
  return useQuery<CulturalTaskDTO, Error>({
    queryKey: culturalKeys.task(taskId ?? "", demoMode),
    enabled: taskId !== null,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    retry: shouldRetryCulturalRead,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      const requestedId = taskId ?? "";
      if (demoMode) {
        const { demoGetCulturalTask } =
          await import("../culturalProductionDemoStore");
        return demoGetCulturalTask(requestedId);
      }
      return getCulturalTask(requestedId, signal);
    },
  });
}
