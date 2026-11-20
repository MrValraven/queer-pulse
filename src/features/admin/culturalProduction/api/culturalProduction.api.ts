import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../../shared/api/client";
import type {
  CreateCulturalGuideBody,
  CreateCulturalIdeaBody,
  CreateCulturalTaskBatchBody,
  CreateCulturalTaskBody,
  CulturalGuideDTO,
  CulturalGuideListDTO,
  CulturalIdeaDTO,
  CulturalIdeaListDTO,
  CulturalStaffSearchDTO,
  CulturalStaffSummaryDTO,
  CulturalTaskBatchDTO,
  CulturalTaskDTO,
  CulturalTaskFilters,
  CulturalTaskListDTO,
  ReplaceCulturalGuideBody,
  UpdateCulturalIdeaBody,
  UpdateCulturalTaskBody,
} from "./culturalProduction.types";
import { culturalReasonOf } from "./culturalProduction.types";

/**
 * The admin Cultural Production routes (contract section 7.1,
 * `@Controller('admin/cultural-production')`). Every id rides through
 * `encodeURIComponent`. Idea writes answer the whole idea, task writes the
 * whole task, guide writes the whole guide; deletes answer `{ ok: true }`.
 */
const CULTURAL_PATH = "/admin/cultural-production";

/** The retry rule of every Cultural Production read: a refusal that names a
 *  reason, or any other client error (4xx), answers the same on a second
 *  try, so it shows at once. Our own 408 timeout is transient, as in the
 *  app-wide rule. Any other failure retries twice. */
export function shouldRetryCulturalRead(
  failureCount: number,
  error: unknown,
): boolean {
  if (culturalReasonOf(error) !== null) return false;
  const isClientError =
    error instanceof ApiError && error.status < 500 && error.status !== 408;
  return !isClientError && failureCount < 2;
}

const ideaPathOf = (ideaId: string): string =>
  `${CULTURAL_PATH}/ideas/${encodeURIComponent(ideaId)}`;

const taskPathOf = (taskId: string): string =>
  `${CULTURAL_PATH}/tasks/${encodeURIComponent(taskId)}`;

const guidePathOf = (guideId: string): string =>
  `${CULTURAL_PATH}/guides/${encodeURIComponent(guideId)}`;

/** GET staff?q=: staff who can be assigned a task. A blank query sends no
 *  `q` and answers the short preview list (the viewer first). */
export const searchCulturalStaff = async (
  query: string,
  signal?: AbortSignal,
): Promise<CulturalStaffSummaryDTO[]> => {
  const staffPath = `${CULTURAL_PATH}/staff`;
  const term = query.trim();
  const path =
    term === "" ? staffPath : `${staffPath}?q=${encodeURIComponent(term)}`;
  return (
    await apiGet<CulturalStaffSearchDTO>(path, undefined, undefined, signal)
  ).items;
};

/** GET tasks/due-count: the caller's open tasks due today or earlier, the
 *  nav badge's number. */
export const getCulturalTaskDueCount = (
  signal?: AbortSignal,
): Promise<{ count: number }> =>
  apiGet<{ count: number }>(
    `${CULTURAL_PATH}/tasks/due-count`,
    undefined,
    undefined,
    signal,
  );

/** GET ideas: every idea, newest first. */
export const getCulturalIdeas = (
  signal?: AbortSignal,
): Promise<CulturalIdeaListDTO> =>
  apiGet<CulturalIdeaListDTO>(
    `${CULTURAL_PATH}/ideas`,
    undefined,
    undefined,
    signal,
  );

/** GET ideas/:id: the idea with every backer, comment and linked task. */
export const getCulturalIdea = (
  ideaId: string,
  signal?: AbortSignal,
): Promise<CulturalIdeaDTO> =>
  apiGet<CulturalIdeaDTO>(ideaPathOf(ideaId), undefined, undefined, signal);

/** POST ideas. */
export const createCulturalIdea = (
  body: CreateCulturalIdeaBody,
): Promise<CulturalIdeaDTO> =>
  apiPost<CulturalIdeaDTO>(`${CULTURAL_PATH}/ideas`, body);

/** PATCH ideas/:id: only the properties sent change. */
export const updateCulturalIdea = (
  ideaId: string,
  body: UpdateCulturalIdeaBody,
): Promise<CulturalIdeaDTO> =>
  apiPatch<CulturalIdeaDTO>(ideaPathOf(ideaId), body);

/** DELETE ideas/:id: its linked tasks stay and lose the link. */
export const deleteCulturalIdea = (ideaId: string): Promise<{ ok: true }> =>
  apiDelete<{ ok: true }>(ideaPathOf(ideaId));

/** PUT ideas/:id/backing: the caller backs the idea (idempotent). */
export const backCulturalIdea = (ideaId: string): Promise<CulturalIdeaDTO> =>
  apiPut<CulturalIdeaDTO>(`${ideaPathOf(ideaId)}/backing`);

/** DELETE ideas/:id/backing: the caller takes their backing back. */
export const unbackCulturalIdea = (ideaId: string): Promise<CulturalIdeaDTO> =>
  apiDelete<CulturalIdeaDTO>(`${ideaPathOf(ideaId)}/backing`);

/** POST ideas/:id/comments: a comment by the caller. */
export const addCulturalIdeaComment = (
  ideaId: string,
  body: { body: string },
): Promise<CulturalIdeaDTO> =>
  apiPost<CulturalIdeaDTO>(`${ideaPathOf(ideaId)}/comments`, body);

/** DELETE ideas/:id/comments/:commentId. */
export const deleteCulturalIdeaComment = (
  ideaId: string,
  commentId: string,
): Promise<CulturalIdeaDTO> =>
  apiDelete<CulturalIdeaDTO>(
    `${ideaPathOf(ideaId)}/comments/${encodeURIComponent(commentId)}`,
  );

/** GET tasks: only the filters that are set ride along. A null
 *  `assignedTo` is everyone; a null `status` is every status. */
export const getCulturalTasks = (
  filters: CulturalTaskFilters,
  signal?: AbortSignal,
): Promise<CulturalTaskListDTO> => {
  const params = new URLSearchParams();
  if (filters.assignedTo !== null) params.set("assignedTo", filters.assignedTo);
  if (filters.status !== null) params.set("status", filters.status);
  const queryString = params.toString();
  const tasksPath = `${CULTURAL_PATH}/tasks`;
  return apiGet<CulturalTaskListDTO>(
    queryString === "" ? tasksPath : `${tasksPath}?${queryString}`,
    undefined,
    undefined,
    signal,
  );
};

/** GET tasks/:id: the task with its notes. */
export const getCulturalTask = (
  taskId: string,
  signal?: AbortSignal,
): Promise<CulturalTaskDTO> =>
  apiGet<CulturalTaskDTO>(taskPathOf(taskId), undefined, undefined, signal);

/** POST tasks. */
export const createCulturalTask = (
  body: CreateCulturalTaskBody,
): Promise<CulturalTaskDTO> =>
  apiPost<CulturalTaskDTO>(`${CULTURAL_PATH}/tasks`, body);

/** PATCH tasks/:id: only the properties sent change. */
export const updateCulturalTask = (
  taskId: string,
  body: UpdateCulturalTaskBody,
): Promise<CulturalTaskDTO> =>
  apiPatch<CulturalTaskDTO>(taskPathOf(taskId), body);

/** DELETE tasks/:id. */
export const deleteCulturalTask = (taskId: string): Promise<{ ok: true }> =>
  apiDelete<{ ok: true }>(taskPathOf(taskId));

/** POST tasks/:id/assignees: puts a staff member on the task. */
export const assignCulturalTask = (
  taskId: string,
  body: { userId: string },
): Promise<CulturalTaskDTO> =>
  apiPost<CulturalTaskDTO>(`${taskPathOf(taskId)}/assignees`, body);

/** DELETE tasks/:id/assignees/:userId: takes a staff member off the task. */
export const unassignCulturalTask = (
  taskId: string,
  userId: string,
): Promise<CulturalTaskDTO> =>
  apiDelete<CulturalTaskDTO>(
    `${taskPathOf(taskId)}/assignees/${encodeURIComponent(userId)}`,
  );

/** GET guides: every guide, both languages. */
export const getCulturalGuides = (
  signal?: AbortSignal,
): Promise<CulturalGuideListDTO> =>
  apiGet<CulturalGuideListDTO>(
    `${CULTURAL_PATH}/guides`,
    undefined,
    undefined,
    signal,
  );

/** GET guides/:id: the guide with its sections, steps and revision. */
export const getCulturalGuide = (
  guideId: string,
  signal?: AbortSignal,
): Promise<CulturalGuideDTO> =>
  apiGet<CulturalGuideDTO>(guidePathOf(guideId), undefined, undefined, signal);

/** POST guides. */
export const createCulturalGuide = (
  body: CreateCulturalGuideBody,
): Promise<CulturalGuideDTO> =>
  apiPost<CulturalGuideDTO>(`${CULTURAL_PATH}/guides`, body);

/** PUT guides/:id: the whole guide, sent with the revision it started from.
 *  A newer save refuses with CULTURAL_GUIDE_EDIT_CONFLICT. */
export const replaceCulturalGuide = (
  guideId: string,
  body: ReplaceCulturalGuideBody,
): Promise<CulturalGuideDTO> =>
  apiPut<CulturalGuideDTO>(guidePathOf(guideId), body);

/** DELETE guides/:id: its tasks stay and lose the link. */
export const deleteCulturalGuide = (guideId: string): Promise<{ ok: true }> =>
  apiDelete<{ ok: true }>(guidePathOf(guideId));

/** POST guides/:id/task-batches: one task per checklist step, each due its
 *  step's days before `eventOn`. */
export const createCulturalTaskBatch = (
  guideId: string,
  body: CreateCulturalTaskBatchBody,
): Promise<CulturalTaskBatchDTO> =>
  apiPost<CulturalTaskBatchDTO>(`${guidePathOf(guideId)}/task-batches`, body);
