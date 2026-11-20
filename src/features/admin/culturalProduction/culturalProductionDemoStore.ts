import { lisbonLeadDay } from "../leads/leadDates";
import {
  CULTURAL_LIST_LIMIT,
  CULTURAL_MAX_ASSIGNEES,
  DEFAULT_CULTURAL_IDEA_STATUS,
  DEFAULT_CULTURAL_TASK_STATUS,
  type CreateCulturalGuideBody,
  type CreateCulturalIdeaBody,
  type CreateCulturalTaskBatchBody,
  type CreateCulturalTaskBody,
  type CulturalGuideDTO,
  type CulturalGuideListDTO,
  type CulturalIdeaDTO,
  type CulturalIdeaListDTO,
  type CulturalStaffSummaryDTO,
  type CulturalTaskBatchDTO,
  type CulturalTaskDTO,
  type CulturalTaskFilters,
  type CulturalTaskListDTO,
  type ReplaceCulturalGuideBody,
  type UpdateCulturalIdeaBody,
  type UpdateCulturalTaskBody,
} from "./api/culturalProduction.types";
import { DEMO_CULTURAL_GUIDES } from "./culturalGuidesDemo.data";
import {
  DEMO_CULTURAL_IDEAS,
  DEMO_CULTURAL_TASKS,
  type DemoCulturalProductionSeed,
} from "./culturalProductionDemo.data";
import {
  compareGuides,
  compareIdeas,
  compareTasks,
  demoStaffEligibilityOf,
  isOpenTask,
  searchDemoCulturalStaff,
  seededGuide,
  seededIdea,
  seededTask,
  toGuideDTO,
  toGuideListItem,
  toIdeaDTO,
  toIdeaListItem,
  toTaskDTO,
  toTaskListItem,
  type CulturalDemoState,
  type StoredGuide,
  type StoredIdea,
  type StoredTask,
} from "./culturalProductionDemoProjection";
import {
  culturalRefusal,
  normalizeAssigneeIds,
  normalizeComment,
  normalizeEventOn,
  normalizeGuideFields,
  normalizeIdeaFields,
  normalizeSearchTerm,
  normalizeTaskFields,
  normalizeTaskFilters,
} from "./culturalProductionDemoRules";
import { DEMO_CULTURAL_VIEWER_ID } from "./culturalProductionDemoViewer";
import { dueOnForStep } from "./guideTaskDates";

export { culturalRefusal } from "./culturalProductionDemoRules";

// The demo Cultural Production record: one lazily seeded in-memory state,
// read and written by the page in demo (contract section 13, modelled on
// `leadsDemoStore`). It keeps no browser storage, so a reload restores the
// seed. Each function answers its route's shape and refusals in the route's
// check order (contract 7.2 to 7.5); every write is by the demo viewer, who
// is in the staff tier. Demo sends no bell rows.

const DEFAULT_SEED: DemoCulturalProductionSeed = {
  ideas: DEMO_CULTURAL_IDEAS,
  tasks: DEMO_CULTURAL_TASKS,
  guides: DEMO_CULTURAL_GUIDES,
};

let culturalState: CulturalDemoState | null = null;

function current(): CulturalDemoState {
  if (culturalState === null) resetDemoCulturalProduction();
  return culturalState ?? { ideas: [], tasks: [], guides: [], nextNumber: 1 };
}

function nextIdOf(prefix: string): string {
  const state = current();
  const number = state.nextNumber;
  state.nextNumber += 1;
  return `${prefix}-${String(number).padStart(6, "0")}`;
}

const makeGuidePartId = (): string => nextIdOf("demo-cp-guide-part");

/** Put the demo back to a seed (the authored one when none is given); the
 *  relative days become days from today's Lisbon day. */
export function resetDemoCulturalProduction(
  seed: DemoCulturalProductionSeed = DEFAULT_SEED,
): void {
  const nowMs = Date.now();
  const today = lisbonLeadDay();
  culturalState = {
    ideas: seed.ideas.map((idea) => seededIdea(idea, nowMs)),
    tasks: seed.tasks.map((task) => seededTask(task, nowMs, today)),
    guides: seed.guides.map((guide) => seededGuide(guide, nowMs)),
    nextNumber: 1,
  };
}

const nowStamp = (): string => new Date().toISOString();

function findIdea(ideaId: string): StoredIdea {
  const idea = current().ideas.find((candidate) => candidate.id === ideaId);
  if (!idea) throw culturalRefusal("CULTURAL_IDEA_NOT_FOUND", 404);
  return idea;
}

function findTask(taskId: string): StoredTask {
  const task = current().tasks.find((candidate) => candidate.id === taskId);
  if (!task) throw culturalRefusal("CULTURAL_TASK_NOT_FOUND", 404);
  return task;
}

function findGuide(guideId: string): StoredGuide {
  const guide = current().guides.find((candidate) => candidate.id === guideId);
  if (!guide) throw culturalRefusal("CULTURAL_GUIDE_NOT_FOUND", 404);
  return guide;
}

/** Copies the sent fields that differ; answers whether any did. */
function applyChanges<Row extends object>(
  row: Row,
  fields: Partial<Row>,
): boolean {
  let hasChanged = false;
  for (const [field, value] of Object.entries(fields)) {
    if (value === undefined || Reflect.get(row, field) === value) continue;
    Reflect.set(row, field, value);
    hasChanged = true;
  }
  return hasChanged;
}

/** Whether a person may be newly assigned. A body list names the person on
 *  the refusal; the single assign route does not. */
function assertAssignable(userId: string, isBodyList: boolean): void {
  const named = isBodyList ? { userId } : {};
  const eligibility = demoStaffEligibilityOf(userId);
  if (eligibility === "not_found") {
    throw culturalRefusal("CULTURAL_ASSIGNEE_NOT_FOUND", 404, named);
  }
  if (eligibility === "no_access") {
    throw culturalRefusal("CULTURAL_ASSIGNEE_NOT_STAFF", 400, {
      reason: "no_access",
      ...named,
    });
  }
}

/** `GET staff?q=` in demo. */
export function demoSearchCulturalStaff(
  query: string,
): CulturalStaffSummaryDTO[] {
  return searchDemoCulturalStaff(normalizeSearchTerm(query));
}

/** `GET tasks/due-count` in demo: the viewer's open tasks due on or before
 *  today, the same rows Assigned to me, Open shows as overdue or today. */
export function demoCulturalTaskDueCount(today: string = lisbonLeadDay()): {
  count: number;
} {
  return {
    count: current().tasks.filter(
      (task) =>
        isOpenTask(task) &&
        task.dueOn !== null &&
        task.dueOn <= today &&
        task.assigneeIds.includes(DEMO_CULTURAL_VIEWER_ID),
    ).length,
  };
}

// Ideas

export function demoListCulturalIdeas(): CulturalIdeaListDTO {
  const state = current();
  const ideas = [...state.ideas].sort(compareIdeas);
  return {
    items: ideas
      .slice(0, CULTURAL_LIST_LIMIT)
      .map((idea) => toIdeaListItem(idea, state)),
    isTruncated: ideas.length > CULTURAL_LIST_LIMIT,
  };
}

export function demoGetCulturalIdea(ideaId: string): CulturalIdeaDTO {
  return toIdeaDTO(findIdea(ideaId), current());
}

export function demoCreateCulturalIdea(
  body: CreateCulturalIdeaBody,
): CulturalIdeaDTO {
  const fields = normalizeIdeaFields(body, true);
  const stamp = nowStamp();
  const idea: StoredIdea = {
    id: nextIdOf("demo-cp-idea"),
    title: fields.title ?? "",
    description: fields.description ?? "",
    eventType: fields.eventType ?? "other",
    status: fields.status ?? DEFAULT_CULTURAL_IDEA_STATUS,
    authorId: DEMO_CULTURAL_VIEWER_ID,
    createdAt: stamp,
    updatedAt: stamp,
    backerIds: [],
    comments: [],
  };
  current().ideas.push(idea);
  return toIdeaDTO(idea, current());
}

/** A body with no change answers the idea as it is, `updatedAt` kept. */
export function demoUpdateCulturalIdea(
  ideaId: string,
  body: UpdateCulturalIdeaBody,
): CulturalIdeaDTO {
  const fields = normalizeIdeaFields(body, false);
  const idea = findIdea(ideaId);
  if (applyChanges(idea, fields)) idea.updatedAt = nowStamp();
  return toIdeaDTO(idea, current());
}

/** The idea, its backers and comments go; its tasks stay, unlinked. */
export function demoDeleteCulturalIdea(ideaId: string): { ok: true } {
  const state = current();
  const idea = findIdea(ideaId);
  state.ideas = state.ideas.filter((candidate) => candidate !== idea);
  for (const task of state.tasks) {
    if (task.ideaId === idea.id) task.ideaId = null;
  }
  return { ok: true };
}

/** Idempotent, and backing never touches `updatedAt`. */
export function demoBackCulturalIdea(ideaId: string): CulturalIdeaDTO {
  const idea = findIdea(ideaId);
  if (!idea.backerIds.includes(DEMO_CULTURAL_VIEWER_ID)) {
    idea.backerIds.push(DEMO_CULTURAL_VIEWER_ID);
  }
  return toIdeaDTO(idea, current());
}

export function demoUnbackCulturalIdea(ideaId: string): CulturalIdeaDTO {
  const idea = findIdea(ideaId);
  idea.backerIds = idea.backerIds.filter(
    (backerId) => backerId !== DEMO_CULTURAL_VIEWER_ID,
  );
  return toIdeaDTO(idea, current());
}

/** The body is checked before the idea is read, as the route does. */
export function demoAddCulturalIdeaComment(
  ideaId: string,
  body: { body: string },
): CulturalIdeaDTO {
  const text = normalizeComment(body.body);
  const idea = findIdea(ideaId);
  idea.comments.push({
    id: nextIdOf("demo-cp-comment"),
    body: text,
    authorId: DEMO_CULTURAL_VIEWER_ID,
    createdAt: nowStamp(),
  });
  return toIdeaDTO(idea, current());
}

export function demoDeleteCulturalIdeaComment(
  ideaId: string,
  commentId: string,
): CulturalIdeaDTO {
  const idea = findIdea(ideaId);
  const comment = idea.comments.find((candidate) => candidate.id === commentId);
  if (!comment) throw culturalRefusal("CULTURAL_COMMENT_NOT_FOUND", 404);
  idea.comments = idea.comments.filter((candidate) => candidate !== comment);
  return toIdeaDTO(idea, current());
}

// Tasks

/** Tasks under both filters in the list order; the counts follow
 *  `assignedTo` alone. */
export function demoListCulturalTasks(
  filters: CulturalTaskFilters,
): CulturalTaskListDTO {
  const { assignedTo, status } = normalizeTaskFilters(filters);
  const state = current();
  const assigned = state.tasks.filter((task) => {
    if (assignedTo === "me") {
      return task.assigneeIds.includes(DEMO_CULTURAL_VIEWER_ID);
    }
    if (assignedTo === "unassigned") return task.assigneeIds.length === 0;
    return true;
  });
  const shown = assigned
    .filter((task) =>
      status === "open"
        ? isOpenTask(task)
        : status === null || task.status === status,
    )
    .sort(compareTasks);
  const countOf = (taskStatus: StoredTask["status"]) =>
    assigned.filter((task) => task.status === taskStatus).length;
  return {
    items: shown
      .slice(0, CULTURAL_LIST_LIMIT)
      .map((task) => toTaskListItem(task, state)),
    counts: {
      todo: countOf("todo"),
      doing: countOf("doing"),
      done: countOf("done"),
    },
    isTruncated: shown.length > CULTURAL_LIST_LIMIT,
  };
}

export function demoGetCulturalTask(taskId: string): CulturalTaskDTO {
  return toTaskDTO(findTask(taskId), current());
}

/** A linked idea or guide must exist; null and absent pass. */
function assertLinksExist(fields: {
  ideaId?: string | null;
  guideId?: string | null;
}): void {
  const { ideas, guides } = current();
  if (fields.ideaId && !ideas.some((idea) => idea.id === fields.ideaId)) {
    throw culturalRefusal("CULTURAL_LINKED_IDEA_NOT_FOUND", 400);
  }
  if (fields.guideId && !guides.some((guide) => guide.id === fields.guideId)) {
    throw culturalRefusal("CULTURAL_LINKED_GUIDE_NOT_FOUND", 400);
  }
}

export function demoCreateCulturalTask(
  body: CreateCulturalTaskBody,
): CulturalTaskDTO {
  const fields = normalizeTaskFields(body, true);
  const assigneeIds = normalizeAssigneeIds(body.assigneeIds);
  assertLinksExist(fields);
  for (const userId of assigneeIds) assertAssignable(userId, true);
  const stamp = nowStamp();
  const status = fields.status ?? DEFAULT_CULTURAL_TASK_STATUS;
  const task: StoredTask = {
    id: nextIdOf("demo-cp-task"),
    title: fields.title ?? "",
    notes: fields.notes ?? "",
    status,
    dueOn: fields.dueOn ?? null,
    eventOn: null,
    ideaId: fields.ideaId ?? null,
    guideId: fields.guideId ?? null,
    authorId: DEMO_CULTURAL_VIEWER_ID,
    assigneeIds,
    createdAt: stamp,
    updatedAt: stamp,
    completedAt: status === "done" ? stamp : null,
  };
  current().tasks.push(task);
  return toTaskDTO(task, current());
}

/** Moving into done stamps `completedAt`, moving out clears it. Assignees
 *  never change here. */
export function demoUpdateCulturalTask(
  taskId: string,
  body: UpdateCulturalTaskBody,
): CulturalTaskDTO {
  const fields = normalizeTaskFields(body, false);
  const task = findTask(taskId);
  assertLinksExist(fields);
  const wasDone = task.status === "done";
  if (applyChanges(task, fields)) {
    const stamp = nowStamp();
    task.updatedAt = stamp;
    if (!wasDone && task.status === "done") task.completedAt = stamp;
    if (wasDone && task.status !== "done") task.completedAt = null;
  }
  return toTaskDTO(task, current());
}

export function demoDeleteCulturalTask(taskId: string): { ok: true } {
  const state = current();
  const task = findTask(taskId);
  state.tasks = state.tasks.filter((candidate) => candidate !== task);
  return { ok: true };
}

/** In the route's check order (contract 7.4). Someone already assigned
 *  answers the task unchanged, with no eligibility check. */
export function demoAssignCulturalTask(
  taskId: string,
  body: { userId: string },
): CulturalTaskDTO {
  const userId: unknown = body.userId;
  if (typeof userId !== "string" || userId.trim() === "") {
    throw culturalRefusal("CULTURAL_ASSIGNEE_NOT_FOUND", 400);
  }
  const task = findTask(taskId);
  if (task.assigneeIds.includes(userId)) return toTaskDTO(task, current());
  assertAssignable(userId, false);
  if (task.assigneeIds.length >= CULTURAL_MAX_ASSIGNEES) {
    throw culturalRefusal("CULTURAL_TOO_MANY_ASSIGNEES", 409);
  }
  task.assigneeIds.push(userId);
  task.updatedAt = nowStamp();
  return toTaskDTO(task, current());
}

/** Someone not assigned answers the task unchanged. */
export function demoUnassignCulturalTask(
  taskId: string,
  userId: string,
): CulturalTaskDTO {
  const task = findTask(taskId);
  if (task.assigneeIds.includes(userId)) {
    task.assigneeIds = task.assigneeIds.filter((id) => id !== userId);
    task.updatedAt = nowStamp();
  }
  return toTaskDTO(task, current());
}

// Guides

export function demoListCulturalGuides(): CulturalGuideListDTO {
  return {
    items: [...current().guides].sort(compareGuides).map(toGuideListItem),
  };
}

export function demoGetCulturalGuide(guideId: string): CulturalGuideDTO {
  return toGuideDTO(findGuide(guideId));
}

export function demoCreateCulturalGuide(
  body: CreateCulturalGuideBody,
): CulturalGuideDTO {
  const fields = normalizeGuideFields(body, false, makeGuidePartId);
  const stamp = nowStamp();
  const guide: StoredGuide = {
    id: nextIdOf("demo-cp-guide"),
    title: fields.title,
    eventType: fields.eventType,
    locale: fields.locale,
    summary: fields.summary,
    sections: fields.sections,
    revision: 1,
    authorId: DEMO_CULTURAL_VIEWER_ID,
    updatedById: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
  current().guides.push(guide);
  return toGuideDTO(guide);
}

/** Saves the whole guide when `revision` is the one stored, and bumps it;
 *  a stale revision answers 409 with the current one. */
export function demoReplaceCulturalGuide(
  guideId: string,
  body: ReplaceCulturalGuideBody,
): CulturalGuideDTO {
  const { revision, ...fields } = normalizeGuideFields(
    body,
    true,
    makeGuidePartId,
  );
  const guide = findGuide(guideId);
  if (revision !== guide.revision) {
    throw culturalRefusal("CULTURAL_GUIDE_EDIT_CONFLICT", 409, {
      revision: guide.revision,
    });
  }
  Object.assign(guide, fields, {
    revision: guide.revision + 1,
    updatedById: DEMO_CULTURAL_VIEWER_ID,
    updatedAt: nowStamp(),
  });
  return toGuideDTO(guide);
}

/** The guide goes; its tasks stay, unlinked. */
export function demoDeleteCulturalGuide(guideId: string): { ok: true } {
  const state = current();
  const guide = findGuide(guideId);
  state.guides = state.guides.filter((candidate) => candidate !== guide);
  for (const task of state.tasks) {
    if (task.guideId === guide.id) task.guideId = null;
  }
  return { ok: true };
}

/** One todo task per checklist step, sections then steps in order, each
 *  assigned to everyone sent (contract 7.5). Stamps each step one
 *  millisecond apart so the list keeps the guide's step order on equal due days. */
export function demoCreateCulturalTaskBatch(
  guideId: string,
  body: CreateCulturalTaskBatchBody,
): CulturalTaskBatchDTO {
  const eventOn = normalizeEventOn(body.eventOn);
  const assigneeIds = normalizeAssigneeIds(body.assigneeIds);
  const guide = findGuide(guideId);
  const steps = guide.sections.flatMap((section) => section.steps);
  if (steps.length === 0) {
    throw culturalRefusal("CULTURAL_GUIDE_HAS_NO_STEPS", 400);
  }
  for (const userId of assigneeIds) assertAssignable(userId, true);
  const state = current();
  const startMs = Date.now();
  const tasks = steps.map((step, position): StoredTask => {
    const stamp = new Date(startMs + position).toISOString();
    return {
      id: nextIdOf("demo-cp-task"),
      title: step.text,
      notes: "",
      status: "todo",
      dueOn: dueOnForStep(eventOn, step.daysBefore),
      eventOn,
      ideaId: null,
      guideId: guide.id,
      authorId: DEMO_CULTURAL_VIEWER_ID,
      assigneeIds: [...assigneeIds],
      createdAt: stamp,
      updatedAt: stamp,
      completedAt: null,
    };
  });
  state.tasks.push(...tasks);
  return { items: tasks.map((task) => toTaskListItem(task, state)) };
}
