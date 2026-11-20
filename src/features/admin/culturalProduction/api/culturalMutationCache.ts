import { useIsMutating, type QueryClient } from "@tanstack/react-query";
import {
  culturalReasonOf,
  type CulturalGuideDTO,
  type CulturalIdeaDTO,
  type CulturalTaskDTO,
} from "./culturalProduction.types";
import { CULTURAL_WRITE_KEY, culturalKeys } from "./culturalProductionKeys";

/**
 * The Cultural Production cache after a write: one function per row of the
 * contract 12.2 cache table, plus the refusal rules. Every write runs these
 * in both modes, since in demo the store is the source and the cache has to
 * follow it the same way.
 */

/** Each control shows its own reason line, so the global toast stays quiet.
 *  No write passes a `logLabel`: idea, task, comment and guide text never
 *  reaches a log. */
export const CULTURAL_SILENT_META = { silentError: true } as const;

/** True while any Cultural Production write is in flight, so a control can
 *  ignore a second press. */
export function useIsCulturalWriteInFlight(): boolean {
  return useIsMutating({ mutationKey: CULTURAL_WRITE_KEY }) > 0;
}

function invalidate(queryClient: QueryClient, queryKey: readonly unknown[]) {
  void queryClient.invalidateQueries({ queryKey });
}

// An answer older than the cached one (a slow write settling after a newer
// one) leaves the cache alone, so the newer record stays on screen.
function putIfNotOlder<Answer extends { updatedAt: string }>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  answer: Answer,
) {
  const cached = queryClient.getQueryData<Answer>(queryKey);
  const isOlderAnswer =
    cached !== undefined &&
    Date.parse(cached.updatedAt) > Date.parse(answer.updatedAt);
  if (!isOlderAnswer) queryClient.setQueryData(queryKey, answer);
}

/** Idea create, update, back, unback, comment add or delete. A deliberate
 *  addition to contract 12.2: task rows and task details show the linked
 *  idea's title, so the task reads follow too. */
export function saveCulturalIdeaAnswer(
  queryClient: QueryClient,
  idea: CulturalIdeaDTO,
  isDemoMode: boolean,
): void {
  putIfNotOlder(queryClient, culturalKeys.idea(idea.id, isDemoMode), idea);
  invalidate(queryClient, culturalKeys.ideasRoot);
  invalidate(queryClient, culturalKeys.tasksRoot);
  invalidate(queryClient, culturalKeys.taskRoot);
}

/** Idea delete: its linked tasks lose the link, so the task reads follow. */
export function dropCulturalIdea(
  queryClient: QueryClient,
  ideaId: string,
): void {
  queryClient.removeQueries({ queryKey: [...culturalKeys.ideaRoot, ideaId] });
  invalidate(queryClient, culturalKeys.ideasRoot);
  invalidate(queryClient, culturalKeys.tasksRoot);
  invalidate(queryClient, culturalKeys.taskRoot);
}

/** Task create, update, assign, unassign: an idea counts and lists its
 *  linked tasks, so the idea reads follow. */
export function saveCulturalTaskAnswer(
  queryClient: QueryClient,
  task: CulturalTaskDTO,
  isDemoMode: boolean,
): void {
  putIfNotOlder(queryClient, culturalKeys.task(task.id, isDemoMode), task);
  invalidate(queryClient, culturalKeys.tasksRoot);
  invalidate(queryClient, culturalKeys.dueCountRoot);
  invalidate(queryClient, culturalKeys.ideasRoot);
  invalidate(queryClient, culturalKeys.ideaRoot);
}

/** Task delete. */
export function dropCulturalTask(
  queryClient: QueryClient,
  taskId: string,
): void {
  queryClient.removeQueries({ queryKey: [...culturalKeys.taskRoot, taskId] });
  invalidate(queryClient, culturalKeys.tasksRoot);
  invalidate(queryClient, culturalKeys.dueCountRoot);
  invalidate(queryClient, culturalKeys.ideasRoot);
  invalidate(queryClient, culturalKeys.ideaRoot);
}

/** Guide create, replace. A deliberate addition to contract 12.2: task
 *  rows and task details show the linked guide's title, so the task reads
 *  follow too. */
export function saveCulturalGuideAnswer(
  queryClient: QueryClient,
  guide: CulturalGuideDTO,
  isDemoMode: boolean,
): void {
  putIfNotOlder(queryClient, culturalKeys.guide(guide.id, isDemoMode), guide);
  invalidate(queryClient, culturalKeys.guidesRoot);
  invalidate(queryClient, culturalKeys.tasksRoot);
  invalidate(queryClient, culturalKeys.taskRoot);
}

/** Guide delete: tasks made from it lose the link, so the task reads
 *  follow. */
export function dropCulturalGuide(
  queryClient: QueryClient,
  guideId: string,
): void {
  queryClient.removeQueries({ queryKey: [...culturalKeys.guideRoot, guideId] });
  invalidate(queryClient, culturalKeys.guidesRoot);
  invalidate(queryClient, culturalKeys.tasksRoot);
  invalidate(queryClient, culturalKeys.taskRoot);
}

/** Task batch from a guide. */
export function refreshAfterCulturalTaskBatch(queryClient: QueryClient): void {
  invalidate(queryClient, culturalKeys.tasksRoot);
  invalidate(queryClient, culturalKeys.dueCountRoot);
}

/** The records a refused write was about: the route's own id and any id
 *  its body linked. */
export interface CulturalRefusalSubject {
  ideaId?: string | null;
  taskId?: string | null;
  guideId?: string | null;
}

function dropDetail(
  queryClient: QueryClient,
  detailRoot: readonly unknown[],
  listRoot: readonly unknown[],
  recordId: string | null | undefined,
) {
  if (recordId) {
    queryClient.removeQueries({ queryKey: [...detailRoot, recordId] });
  }
  invalidate(queryClient, listRoot);
}

/**
 * The refusal rules. A not-found refusal means the record went away in
 * another tab: its list reads again and its detail key goes. An assignee
 * refusal means the picker showed someone who can no longer hold a task,
 * so the staff search reads again. A full task reads again, since it filled
 * up elsewhere. CULTURAL_GUIDE_EDIT_CONFLICT does nothing here: the editor
 * offers "Load the latest version", which refetches the guide.
 */
export function refreshAfterCulturalRefusal(
  queryClient: QueryClient,
  cause: unknown,
  subject: CulturalRefusalSubject,
): void {
  const reason = culturalReasonOf(cause);
  switch (reason) {
    case "CULTURAL_IDEA_NOT_FOUND":
    case "CULTURAL_LINKED_IDEA_NOT_FOUND":
      dropDetail(
        queryClient,
        culturalKeys.ideaRoot,
        culturalKeys.ideasRoot,
        subject.ideaId,
      );
      // Tasks linked to the idea show its title.
      invalidate(queryClient, culturalKeys.tasksRoot);
      invalidate(queryClient, culturalKeys.taskRoot);
      return;
    case "CULTURAL_TASK_NOT_FOUND":
      dropDetail(
        queryClient,
        culturalKeys.taskRoot,
        culturalKeys.tasksRoot,
        subject.taskId,
      );
      invalidate(queryClient, culturalKeys.dueCountRoot);
      // Ideas count and list their linked tasks.
      invalidate(queryClient, culturalKeys.ideasRoot);
      invalidate(queryClient, culturalKeys.ideaRoot);
      return;
    case "CULTURAL_GUIDE_NOT_FOUND":
    case "CULTURAL_LINKED_GUIDE_NOT_FOUND":
      dropDetail(
        queryClient,
        culturalKeys.guideRoot,
        culturalKeys.guidesRoot,
        subject.guideId,
      );
      return;
    case "CULTURAL_COMMENT_NOT_FOUND":
      // The comment went; the idea stands, so it reads again.
      if (subject.ideaId) {
        invalidate(queryClient, [...culturalKeys.ideaRoot, subject.ideaId]);
      }
      invalidate(queryClient, culturalKeys.ideasRoot);
      return;
    case "CULTURAL_ASSIGNEE_NOT_STAFF":
    case "CULTURAL_ASSIGNEE_NOT_FOUND":
      invalidate(queryClient, culturalKeys.staffSearchRoot);
      return;
    case "CULTURAL_TOO_MANY_ASSIGNEES":
      if (subject.taskId) {
        invalidate(queryClient, [...culturalKeys.taskRoot, subject.taskId]);
      }
      return;
    default:
      return;
  }
}
