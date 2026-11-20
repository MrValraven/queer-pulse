import { describe, expect, it } from "vitest";
import { stepWhenOf, taskDueStateOf } from "./taskDueState";

const TODAY = "2026-11-20";

describe("taskDueStateOf", () => {
  it("reads a past day as overdue", () => {
    expect(taskDueStateOf({ status: "todo", dueOn: "2026-11-19" }, TODAY)).toBe(
      "overdue",
    );
  });

  it("reads today as today", () => {
    expect(taskDueStateOf({ status: "doing", dueOn: TODAY }, TODAY)).toBe(
      "today",
    );
  });

  it("reads a later day as upcoming", () => {
    expect(taskDueStateOf({ status: "todo", dueOn: "2026-12-01" }, TODAY)).toBe(
      "upcoming",
    );
  });

  it("reads no day as none", () => {
    expect(taskDueStateOf({ status: "todo", dueOn: null }, TODAY)).toBe("none");
  });

  it("lets done win over any day", () => {
    expect(taskDueStateOf({ status: "done", dueOn: "2026-11-01" }, TODAY)).toBe(
      "done",
    );
    expect(taskDueStateOf({ status: "done", dueOn: null }, TODAY)).toBe("done");
  });
});

describe("stepWhenOf", () => {
  const prefix = "admin:culturalProduction.guides.stepWhen";

  it.each([
    [42, { key: `${prefix}.before`, count: 42 }],
    [1, { key: `${prefix}.before`, count: 1 }],
    [0, { key: `${prefix}.dayOf` }],
    [-1, { key: `${prefix}.after`, count: 1 }],
    [-3, { key: `${prefix}.after`, count: 3 }],
    [null, { key: `${prefix}.anyTime` }],
  ] as const)("reads %s days before", (daysBefore, expected) => {
    expect(stepWhenOf(daysBefore)).toEqual(expected);
  });
});
