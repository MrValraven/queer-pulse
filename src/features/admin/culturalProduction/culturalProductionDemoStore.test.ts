import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { lisbonLeadDay } from "../leads/leadDates";
import { DEMO_CULTURAL_GUIDES } from "./culturalGuidesDemo.data";
import {
  DEMO_CULTURAL_IDEAS,
  type DemoCulturalTaskSeed,
} from "./culturalProductionDemo.data";
import {
  demoAddCulturalIdeaComment,
  demoAssignCulturalTask,
  demoBackCulturalIdea,
  demoCreateCulturalGuide,
  demoCreateCulturalTaskBatch,
  demoCulturalTaskDueCount,
  demoDeleteCulturalIdea,
  demoGetCulturalGuide,
  demoGetCulturalIdea,
  demoGetCulturalTask,
  demoListCulturalIdeas,
  demoListCulturalTasks,
  demoReplaceCulturalGuide,
  demoSearchCulturalStaff,
  demoUpdateCulturalTask,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { DEMO_CULTURAL_VIEWER_ID } from "./culturalProductionDemoViewer";
import { dueOnForStep } from "./guideTaskDates";

const QUIZ_GUIDE_EN_ID = "demo-guide-quiz-en";

/** Runs a store call that must refuse, and hands back what it threw. */
function refusalOf(call: () => unknown): ApiError {
  try {
    call();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("expected the call to refuse");
}

beforeEach(() => {
  resetDemoCulturalProduction();
});

describe("culturalProductionDemoStore ideas", () => {
  it("lists six ideas newest first", () => {
    const ids = demoListCulturalIdeas().items.map((idea) => idea.id);
    expect(ids).toEqual([
      "demo-idea-poets-open-mic",
      "demo-idea-film-qa",
      "demo-idea-drag-bingo",
      "demo-idea-eurovision-quiz",
      "demo-idea-picnic-games",
      "demo-idea-zine-workshop",
    ]);
    const createdAts = demoListCulturalIdeas().items.map(
      (idea) => idea.createdAt,
    );
    expect([...createdAts].sort().reverse()).toEqual(createdAts);
  });

  it("backs an idea once however often it is pressed", () => {
    demoBackCulturalIdea("demo-idea-film-qa");
    demoBackCulturalIdea("demo-idea-film-qa");
    const idea = demoBackCulturalIdea("demo-idea-film-qa");
    expect(idea.backerCount).toBe(2);
    expect(idea.isBackedByMe).toBe(true);
    expect(
      idea.backers.filter((backer) => backer.id === DEMO_CULTURAL_VIEWER_ID),
    ).toHaveLength(1);
  });

  it("posts a comment and answers it last", () => {
    const before = demoGetCulturalIdea("demo-idea-drag-bingo").comments.length;
    const idea = demoAddCulturalIdeaComment("demo-idea-drag-bingo", {
      body: "  I can ask the bar on Rua do Benformoso too  ",
    });
    expect(idea.comments).toHaveLength(before + 1);
    expect(idea.comments.at(-1)).toMatchObject({
      body: "I can ask the bar on Rua do Benformoso too",
      author: { id: DEMO_CULTURAL_VIEWER_ID },
      canDelete: true,
    });
    expect(idea.commentCount).toBe(before + 1);
  });

  it("refuses a blank comment with CULTURAL_COMMENT_EMPTY", () => {
    const refusal = refusalOf(() =>
      demoAddCulturalIdeaComment("demo-idea-drag-bingo", { body: "   \n " }),
    );
    expect(refusal.status).toBe(400);
    expect(refusal.data).toMatchObject({ code: "CULTURAL_COMMENT_EMPTY" });
    expect(demoGetCulturalIdea("demo-idea-drag-bingo").comments).toHaveLength(
      2,
    );
  });

  it("keeps linked tasks when an idea is deleted", () => {
    expect(demoGetCulturalTask("demo-task-picnic-permit").idea).toEqual({
      id: "demo-idea-picnic-games",
      title: "Board game picnic in Jardim da Estrela",
    });
    expect(demoDeleteCulturalIdea("demo-idea-picnic-games")).toEqual({
      ok: true,
    });
    expect(demoGetCulturalTask("demo-task-picnic-permit").idea).toBeNull();
    expect(demoGetCulturalTask("demo-task-picnic-games").idea).toBeNull();
    expect(demoListCulturalIdeas().items).toHaveLength(
      DEMO_CULTURAL_IDEAS.length - 1,
    );
  });
});

describe("culturalProductionDemoStore tasks", () => {
  it("reads 2 on the badge and lists the same two overdue or due-today rows under me and open", () => {
    const today = lisbonLeadDay();
    expect(demoCulturalTaskDueCount(today)).toEqual({ count: 2 });
    const mineOpen = demoListCulturalTasks({
      assignedTo: "me",
      status: "open",
    }).items;
    const dueRows = mineOpen.filter(
      (task) => task.dueOn !== null && task.dueOn <= today,
    );
    expect(dueRows.map((task) => task.id)).toEqual([
      "demo-task-bingo-venue",
      "demo-task-picnic-permit",
    ]);
    expect(mineOpen.map((task) => task.id)).toEqual([
      "demo-task-bingo-venue",
      "demo-task-picnic-permit",
      "demo-task-quiz-questions",
    ]);
  });

  it("counts todo, doing and done under the assignedTo filter", () => {
    const mine = demoListCulturalTasks({ assignedTo: "me", status: "done" });
    expect(mine.counts).toEqual({ todo: 2, doing: 1, done: 1 });
    expect(mine.items.map((task) => task.id)).toEqual([
      "demo-task-thank-venue",
    ]);
    const everyone = demoListCulturalTasks({ assignedTo: null, status: null });
    expect(everyone.counts).toEqual({ todo: 6, doing: 1, done: 1 });
    expect(everyone.items).toHaveLength(8);
    expect(everyone.items.at(-1)?.id).toBe("demo-task-thank-venue");
    const unassigned = demoListCulturalTasks({
      assignedTo: "unassigned",
      status: "open",
    });
    expect(unassigned.counts).toEqual({ todo: 2, doing: 0, done: 0 });
  });

  it("sets completedAt entering done and clears it leaving done", () => {
    expect(demoGetCulturalTask("demo-task-bingo-venue").completedAt).toBeNull();
    const done = demoUpdateCulturalTask("demo-task-bingo-venue", {
      status: "done",
    });
    expect(done.status).toBe("done");
    expect(done.completedAt).not.toBeNull();
    const reopened = demoUpdateCulturalTask("demo-task-bingo-venue", {
      status: "todo",
    });
    expect(reopened.completedAt).toBeNull();
  });

  it("assigns idempotently, refuses a former staff member with no_access and an eleventh person with 409", () => {
    const again = demoAssignCulturalTask("demo-task-bingo-venue", {
      userId: DEMO_CULTURAL_VIEWER_ID,
    });
    expect(again.assignees.map((person) => person.id)).toEqual([
      DEMO_CULTURAL_VIEWER_ID,
    ]);

    const former = refusalOf(() =>
      demoAssignCulturalTask("demo-task-bingo-venue", {
        userId: "demo-cp-dani",
      }),
    );
    expect(former.status).toBe(400);
    expect(former.data).toMatchObject({
      code: "CULTURAL_ASSIGNEE_NOT_STAFF",
      reason: "no_access",
    });

    const fullTask: DemoCulturalTaskSeed = {
      id: "demo-task-full",
      title: "A task with ten people on it",
      notes: "",
      status: "todo",
      dueInDays: null,
      eventInDays: null,
      ideaId: null,
      guideId: null,
      authorId: DEMO_CULTURAL_VIEWER_ID,
      assigneeIds: Array.from(
        { length: 10 },
        (_slot, index) => `demo-cp-helper-${index + 1}`,
      ),
      daysAgo: 1,
      completedDaysAgo: null,
    };
    resetDemoCulturalProduction({
      ideas: [],
      tasks: [fullTask],
      guides: DEMO_CULTURAL_GUIDES,
    });
    const eleventh = refusalOf(() =>
      demoAssignCulturalTask("demo-task-full", { userId: "demo-cp-nuno" }),
    );
    expect(eleventh.status).toBe(409);
    expect(eleventh.data).toMatchObject({
      code: "CULTURAL_TOO_MANY_ASSIGNEES",
    });
  });

  it("searches staff with the viewer first on a blank query", () => {
    const preview = demoSearchCulturalStaff("  ");
    expect(preview.map((person) => person.id)).toEqual([
      DEMO_CULTURAL_VIEWER_ID,
      "demo-cp-carla",
      "demo-cp-kiko",
      "demo-cp-leonor",
      "demo-cp-nuno",
    ]);
    expect(demoSearchCulturalStaff("dani")).toEqual([]);
    expect(demoSearchCulturalStaff("leo").map((person) => person.id)).toEqual([
      "demo-cp-leonor",
    ]);
  });
});

describe("culturalProductionDemoStore guides", () => {
  it("creates one task per step from the quiz guide with due days from the event date", () => {
    const eventOn = "2027-03-20";
    const guide = demoGetCulturalGuide(QUIZ_GUIDE_EN_ID);
    const steps = guide.sections.flatMap((section) => section.steps);
    const batch = demoCreateCulturalTaskBatch(QUIZ_GUIDE_EN_ID, {
      eventOn,
      assigneeIds: ["demo-cp-nuno"],
    });
    expect(batch.items).toHaveLength(18);
    expect(batch.items.map((task) => task.title)).toEqual(
      steps.map((step) => step.text),
    );
    expect(batch.items.map((task) => task.dueOn)).toEqual(
      steps.map((step) => dueOnForStep(eventOn, step.daysBefore)),
    );
    expect(batch.items[0]).toMatchObject({
      title: "Pick the date, the number of rounds and the team size",
      dueOn: "2027-02-06",
      eventOn,
      status: "todo",
      guide: { id: QUIZ_GUIDE_EN_ID, title: "Quiz night" },
      idea: null,
    });
    expect(batch.items.at(-1)?.dueOn).toBe("2027-03-23");
    expect(
      batch.items.every(
        (task) =>
          task.assignees.length === 1 &&
          task.assignees[0]?.id === "demo-cp-nuno",
      ),
    ).toBe(true);
  });

  it("answers CULTURAL_GUIDE_HAS_NO_STEPS for a guide with no steps", () => {
    const empty = demoCreateCulturalGuide({
      title: "Film night",
      eventType: "film_night",
      locale: "en",
      sections: [{ heading: "The night in short", body: "", steps: [] }],
    });
    const refusal = refusalOf(() =>
      demoCreateCulturalTaskBatch(empty.id, { eventOn: "2027-03-20" }),
    );
    expect(refusal.status).toBe(400);
    expect(refusal.data).toMatchObject({ code: "CULTURAL_GUIDE_HAS_NO_STEPS" });
  });

  it("answers CULTURAL_GUIDE_EDIT_CONFLICT for a stale revision", () => {
    const opened = demoGetCulturalGuide(QUIZ_GUIDE_EN_ID);
    const save = {
      revision: opened.revision,
      title: opened.title,
      eventType: opened.eventType,
      locale: opened.locale,
      summary: opened.summary,
      sections: opened.sections,
    };
    demoReplaceCulturalGuide(QUIZ_GUIDE_EN_ID, save);
    const refusal = refusalOf(() =>
      demoReplaceCulturalGuide(QUIZ_GUIDE_EN_ID, save),
    );
    expect(refusal.status).toBe(409);
    expect(refusal.data).toMatchObject({
      code: "CULTURAL_GUIDE_EDIT_CONFLICT",
      revision: opened.revision + 1,
    });
  });

  it("bumps the revision on save", () => {
    const opened = demoGetCulturalGuide(QUIZ_GUIDE_EN_ID);
    expect(opened.revision).toBe(1);
    expect(opened.updatedBy).toBeNull();
    const saved = demoReplaceCulturalGuide(QUIZ_GUIDE_EN_ID, {
      revision: opened.revision,
      title: "Quiz night at the bar",
      eventType: opened.eventType,
      locale: opened.locale,
      summary: opened.summary,
      sections: opened.sections,
    });
    expect(saved.revision).toBe(2);
    expect(saved.title).toBe("Quiz night at the bar");
    expect(saved.updatedBy?.id).toBe(DEMO_CULTURAL_VIEWER_ID);
    expect(saved.sections.map((section) => section.id)).toEqual(
      opened.sections.map((section) => section.id),
    );
    expect(demoGetCulturalGuide(QUIZ_GUIDE_EN_ID).revision).toBe(2);
  });
});
