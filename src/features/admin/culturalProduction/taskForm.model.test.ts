import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { CulturalTaskDTO } from "./api/culturalProduction.types";
import {
  changedTaskFieldsOf,
  createTaskBodyOf,
  emptyTaskFormValues,
  hasTaskFormChanges,
  localTaskRefusalOf,
  refusedAssigneeIdOf,
  taskFieldErrorOf,
  taskFormValuesOf,
} from "./taskForm.model";

const SAVED_TASK: CulturalTaskDTO = {
  id: "task-1",
  title: "Book the venue",
  notes: "Ask for the back room",
  status: "todo",
  dueOn: "2026-12-01",
  eventOn: null,
  hasNotes: true,
  assignees: [],
  idea: { id: "idea-1", title: "Drag bingo" },
  guide: null,
  author: null,
  createdAt: "2026-11-01T10:00:00.000Z",
  updatedAt: "2026-11-01T10:00:00.000Z",
  completedAt: null,
  canDelete: true,
};

function refusal(code: string, extra: Record<string, unknown> = {}) {
  return new ApiError(400, "Bad Request", { code, ...extra });
}

describe("taskForm.model", () => {
  it("diffs a cleared due date as null", () => {
    const saved = taskFormValuesOf(SAVED_TASK);
    expect(changedTaskFieldsOf(saved, { ...saved, dueOn: null })).toEqual({
      dueOn: null,
    });
  });

  it("sends nothing when only surrounding spaces changed", () => {
    const saved = taskFormValuesOf(SAVED_TASK);
    const edited = { ...saved, title: "  Book the venue  " };
    expect(changedTaskFieldsOf(saved, edited)).toEqual({});
    expect(hasTaskFormChanges(saved, edited)).toBe(false);
  });

  it("sends each changed field once, trimmed", () => {
    const saved = taskFormValuesOf(SAVED_TASK);
    const edited = {
      ...saved,
      title: " Book the bar ",
      status: "doing" as const,
      ideaId: null,
      guideId: "guide-1",
    };
    expect(changedTaskFieldsOf(saved, edited)).toEqual({
      title: "Book the bar",
      status: "doing",
      ideaId: null,
      guideId: "guide-1",
    });
  });

  it("links a new task to the idea it was opened from", () => {
    const values = emptyTaskFormValues({ id: "idea-1", title: "Drag bingo" });
    expect(values.ideaId).toBe("idea-1");
    expect(values.guideId).toBeNull();
    expect(createTaskBodyOf(values, ["a", "b"]).assigneeIds).toEqual([
      "a",
      "b",
    ]);
  });

  it("refuses a blank title before sending", () => {
    const refused = localTaskRefusalOf(emptyTaskFormValues());
    expect(taskFieldErrorOf(refused).field).toBe("title");
    expect(
      localTaskRefusalOf({ ...emptyTaskFormValues(), title: "Poster" }),
    ).toBeNull();
  });

  it("places assignee refusals with the person they name", () => {
    const cause = refusal("CULTURAL_ASSIGNEE_NOT_STAFF", {
      reason: "no_access",
      userId: "user-9",
    });
    expect(taskFieldErrorOf(cause).field).toBe("assignees");
    expect(refusedAssigneeIdOf(cause)).toBe("user-9");
    expect(refusedAssigneeIdOf(refusal("CULTURAL_TOO_MANY_ASSIGNEES"))).toBe(
      null,
    );
  });

  it("puts a failure with no field above the buttons", () => {
    expect(taskFieldErrorOf(new Error("offline")).field).toBeNull();
    expect(taskFieldErrorOf(refusal("CULTURAL_TASK_NOT_FOUND")).field).toBe(
      null,
    );
  });
});
