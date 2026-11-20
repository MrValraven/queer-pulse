import { foldForSearch } from "../../../shared/lib/foldForSearch";
import { currentUser } from "../../members/data/demoCurrentUser";
import {
  CULTURAL_IDEA_BACKERS_SHOWN,
  CULTURAL_STAFF_PREVIEW_LIMIT,
  CULTURAL_STAFF_SEARCH_LIMIT,
  type CulturalEventType,
  type CulturalGuideDTO,
  type CulturalGuideListItemDTO,
  type CulturalGuideLocale,
  type CulturalGuideSectionDTO,
  type CulturalIdeaDTO,
  type CulturalIdeaListItemDTO,
  type CulturalIdeaStatus,
  type CulturalRefDTO,
  type CulturalStaffSummaryDTO,
  type CulturalTaskDTO,
  type CulturalTaskListItemDTO,
  type CulturalTaskStatus,
} from "./api/culturalProduction.types";
import {
  DEMO_CULTURAL_FORMER_STAFF,
  DEMO_CULTURAL_STAFF,
  type DemoCulturalGuide,
  type DemoCulturalIdeaSeed,
  type DemoCulturalStaffSeed,
  type DemoCulturalTaskSeed,
} from "./culturalProductionDemo.data";
import { DEMO_CULTURAL_VIEWER_ID } from "./culturalProductionDemoViewer";
import { addCalendarDays } from "./guideTaskDates";

// The demo store's rows and how they read on the wire: the seed turned into
// stored rows (contract section 13), and stored rows turned into the DTOs of
// section 6 in the orders of section 7.3. The demo viewer is in the staff
// tier, so every `canDelete` is true. `culturalProductionDemoStore` owns
// the state and the writes.

export interface StoredComment {
  id: string;
  body: string;
  authorId: string | null;
  createdAt: string;
}

export interface StoredIdea {
  id: string;
  title: string;
  description: string;
  eventType: CulturalEventType;
  status: CulturalIdeaStatus;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Oldest backing first. */
  backerIds: string[];
  /** Oldest first. */
  comments: StoredComment[];
}

export interface StoredTask {
  id: string;
  title: string;
  notes: string;
  status: CulturalTaskStatus;
  dueOn: string | null;
  eventOn: string | null;
  ideaId: string | null;
  guideId: string | null;
  authorId: string | null;
  /** Oldest assignment first. */
  assigneeIds: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface StoredGuide {
  id: string;
  title: string;
  eventType: CulturalEventType;
  locale: CulturalGuideLocale;
  summary: string;
  sections: CulturalGuideSectionDTO[];
  revision: number;
  authorId: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CulturalDemoState {
  ideas: StoredIdea[];
  tasks: StoredTask[];
  guides: StoredGuide[];
  nextNumber: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const GUIDE_SEED_DAYS_AGO = 60;

const isoDaysAgo = (nowMs: number, days: number): string =>
  new Date(nowMs - days * DAY_MS).toISOString();

/** Plain text order, the order Postgres `ORDER BY` gives ids and stamps. */
export const compareText = (first: string, second: string): number =>
  first < second ? -1 : first > second ? 1 : 0;

export function seededIdea(
  seed: DemoCulturalIdeaSeed,
  nowMs: number,
): StoredIdea {
  const createdAt = isoDaysAgo(nowMs, seed.daysAgo);
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    eventType: seed.eventType,
    status: seed.status,
    authorId: seed.authorId,
    createdAt,
    updatedAt: createdAt,
    backerIds: [...seed.backerIds],
    comments: seed.comments.map((comment, index) => ({
      id: `${seed.id}-comment-${index + 1}`,
      body: comment.body,
      authorId: comment.authorId,
      createdAt: isoDaysAgo(nowMs, comment.daysAgo),
    })),
  };
}

/** A seeded task with its relative days read against `today`. */
export function seededTask(
  seed: DemoCulturalTaskSeed,
  nowMs: number,
  today: string,
): StoredTask {
  const createdAt = isoDaysAgo(nowMs, seed.daysAgo);
  const dayFromToday = (days: number | null): string | null =>
    days === null ? null : addCalendarDays(today, days);
  return {
    id: seed.id,
    title: seed.title,
    notes: seed.notes,
    status: seed.status,
    dueOn: dayFromToday(seed.dueInDays),
    eventOn: dayFromToday(seed.eventInDays),
    ideaId: seed.ideaId,
    guideId: seed.guideId,
    authorId: seed.authorId,
    assigneeIds: [...seed.assigneeIds],
    createdAt,
    updatedAt: createdAt,
    completedAt:
      seed.completedDaysAgo === null
        ? null
        : isoDaysAgo(nowMs, seed.completedDaysAgo),
  };
}

/** A seeded guide: no author, no saves by a person yet, revision 1. */
export function seededGuide(
  guide: DemoCulturalGuide,
  nowMs: number,
): StoredGuide {
  const createdAt = isoDaysAgo(nowMs, GUIDE_SEED_DAYS_AGO);
  return {
    ...guide,
    sections: structuredClone(guide.sections),
    revision: 1,
    authorId: null,
    updatedById: null,
    createdAt,
    updatedAt: createdAt,
  };
}

// Staff

export function demoViewerStaffSummary(): CulturalStaffSummaryDTO {
  return {
    id: DEMO_CULTURAL_VIEWER_ID,
    slug: currentUser.slug,
    displayName: `${currentUser.first} ${currentUser.last}`,
    avatarUrl: currentUser.photo ?? null,
    avatarCrop: null,
  };
}

const toStaffSummary = (
  person: DemoCulturalStaffSeed,
): CulturalStaffSummaryDTO => ({ ...person, avatarCrop: null });

const findPerson = (
  people: readonly DemoCulturalStaffSeed[],
  userId: string,
): DemoCulturalStaffSeed | undefined =>
  people.find((person) => person.id === userId);

/** The viewer, a staff member or a former one; null for no demo account. */
export function demoStaffSummaryOf(
  userId: string | null,
): CulturalStaffSummaryDTO | null {
  if (userId === null) return null;
  if (userId === DEMO_CULTURAL_VIEWER_ID) return demoViewerStaffSummary();
  const person =
    findPerson(DEMO_CULTURAL_STAFF, userId) ??
    findPerson(DEMO_CULTURAL_FORMER_STAFF, userId);
  return person ? toStaffSummary(person) : null;
}

/** Every summary in id order kept, an id with no account dropped. */
const summariesOf = (userIds: readonly string[]): CulturalStaffSummaryDTO[] =>
  userIds.flatMap((userId) => demoStaffSummaryOf(userId) ?? []);

/** The viewer and the staff may be assigned, former staff lack access, any
 *  other id has no account. */
export function demoStaffEligibilityOf(
  userId: string,
): "eligible" | "not_found" | "no_access" {
  if (userId === DEMO_CULTURAL_VIEWER_ID) return "eligible";
  if (findPerson(DEMO_CULTURAL_STAFF, userId)) return "eligible";
  if (findPerson(DEMO_CULTURAL_FORMER_STAFF, userId)) return "no_access";
  return "not_found";
}

interface StaffSearchRow {
  summary: CulturalStaffSummaryDTO;
  firstName: string;
  lastName: string;
}

function rowOfPerson(person: DemoCulturalStaffSeed): StaffSearchRow {
  const [firstName = "", ...lastNames] = person.displayName.split(" ");
  return {
    summary: toStaffSummary(person),
    firstName,
    lastName: lastNames.join(" "),
  };
}

/** By lower-cased first name, then last name, then id. */
const byName = (first: StaffSearchRow, second: StaffSearchRow): number =>
  compareText(first.firstName.toLowerCase(), second.firstName.toLowerCase()) ||
  compareText(first.lastName.toLowerCase(), second.lastName.toLowerCase()) ||
  compareText(first.summary.id, second.summary.id);

/** `GET staff?q=` over the viewer and the eligible staff. A blank term
 *  previews the viewer then the others by name; any other term matches
 *  names and slugs with folded accents, by name. */
export function searchDemoCulturalStaff(
  term: string,
): CulturalStaffSummaryDTO[] {
  const viewerRow: StaffSearchRow = {
    summary: demoViewerStaffSummary(),
    firstName: currentUser.first,
    lastName: currentUser.last,
  };
  const others = DEMO_CULTURAL_STAFF.map(rowOfPerson).sort(byName);
  if (term === "") {
    return [viewerRow, ...others]
      .slice(0, CULTURAL_STAFF_PREVIEW_LIMIT)
      .map((row) => row.summary);
  }
  const foldedTerm = foldForSearch(term);
  return [viewerRow, ...others]
    .filter((row) =>
      foldForSearch(
        [row.firstName, row.lastName, row.summary.slug].join(" "),
      ).includes(foldedTerm),
    )
    .sort(byName)
    .slice(0, CULTURAL_STAFF_SEARCH_LIMIT)
    .map((row) => row.summary);
}

// Reads

const refOf = (row: CulturalRefDTO | undefined): CulturalRefDTO | null =>
  row ? { id: row.id, title: row.title } : null;

const nullsLast = (
  first: string | null,
  second: string | null,
  direction: 1 | -1,
): number => {
  if (first === second) return 0;
  if (first === null) return 1;
  if (second === null) return -1;
  return compareText(first, second) * direction;
};

/** Open first by due day (none last), then done by the latest completion,
 *  then the oldest created, then id (contract 7.3). */
export function compareTasks(first: StoredTask, second: StoredTask): number {
  const isFirstDone = first.status === "done";
  const isSecondDone = second.status === "done";
  return (
    Number(isFirstDone) - Number(isSecondDone) ||
    nullsLast(
      isFirstDone ? null : first.dueOn,
      isSecondDone ? null : second.dueOn,
      1,
    ) ||
    nullsLast(first.completedAt, second.completedAt, -1) ||
    compareText(first.createdAt, second.createdAt) ||
    compareText(first.id, second.id)
  );
}

export const isOpenTask = (task: StoredTask): boolean =>
  task.status === "todo" || task.status === "doing";

export function toTaskListItem(
  task: StoredTask,
  state: CulturalDemoState,
): CulturalTaskListItemDTO {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    dueOn: task.dueOn,
    eventOn: task.eventOn,
    hasNotes: task.notes !== "",
    assignees: summariesOf(task.assigneeIds),
    idea: refOf(state.ideas.find((idea) => idea.id === task.ideaId)),
    guide: refOf(state.guides.find((guide) => guide.id === task.guideId)),
    author: demoStaffSummaryOf(task.authorId),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt,
    canDelete: true,
  };
}

export const toTaskDTO = (
  task: StoredTask,
  state: CulturalDemoState,
): CulturalTaskDTO => ({ ...toTaskListItem(task, state), notes: task.notes });

/** Newest first, then the higher id. */
export const compareIdeas = (first: StoredIdea, second: StoredIdea): number =>
  compareText(second.createdAt, first.createdAt) ||
  compareText(second.id, first.id);

export function toIdeaListItem(
  idea: StoredIdea,
  state: CulturalDemoState,
): CulturalIdeaListItemDTO {
  const linkedTasks = state.tasks.filter((task) => task.ideaId === idea.id);
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    eventType: idea.eventType,
    status: idea.status,
    author: demoStaffSummaryOf(idea.authorId),
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
    backers: summariesOf(idea.backerIds.slice(0, CULTURAL_IDEA_BACKERS_SHOWN)),
    backerCount: idea.backerIds.length,
    isBackedByMe: idea.backerIds.includes(DEMO_CULTURAL_VIEWER_ID),
    commentCount: idea.comments.length,
    linkedTaskCount: linkedTasks.length,
    openLinkedTaskCount: linkedTasks.filter(isOpenTask).length,
    canDelete: true,
  };
}

export function toIdeaDTO(
  idea: StoredIdea,
  state: CulturalDemoState,
): CulturalIdeaDTO {
  return {
    ...toIdeaListItem(idea, state),
    backers: summariesOf(idea.backerIds),
    comments: idea.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      author: demoStaffSummaryOf(comment.authorId),
      createdAt: comment.createdAt,
      canDelete: true,
    })),
    linkedTasks: state.tasks
      .filter((task) => task.ideaId === idea.id)
      .sort(compareTasks)
      .map((task) => toTaskListItem(task, state)),
  };
}

/** By event type, then language, then title, then id (contract 7.3). */
export const compareGuides = (
  first: StoredGuide,
  second: StoredGuide,
): number =>
  compareText(first.eventType, second.eventType) ||
  compareText(first.locale, second.locale) ||
  compareText(first.title, second.title) ||
  compareText(first.id, second.id);

export function toGuideListItem(guide: StoredGuide): CulturalGuideListItemDTO {
  return {
    id: guide.id,
    title: guide.title,
    eventType: guide.eventType,
    locale: guide.locale,
    summary: guide.summary,
    sectionCount: guide.sections.length,
    stepCount: guide.sections.reduce(
      (total, section) => total + section.steps.length,
      0,
    ),
    author: demoStaffSummaryOf(guide.authorId),
    updatedBy: demoStaffSummaryOf(guide.updatedById),
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
    canDelete: true,
  };
}

export const toGuideDTO = (guide: StoredGuide): CulturalGuideDTO => ({
  ...toGuideListItem(guide),
  sections: structuredClone(guide.sections),
  revision: guide.revision,
});
