import { FiClipboard } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import { createFormatters } from "../../../shared/i18n/format";
import { interpolate } from "../../../shared/i18n/translate";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import {
  CULTURAL_MY_TASKS_HREF,
  culturalTaskHref,
} from "../../admin/culturalProduction/culturalProductionPaths";
import { formatNotification } from "./formatNotification";
import { lifecycleSourceHref } from "./notificationKindHrefs";
import { notificationDtoToView } from "./notifications.adapters";
import type { NotificationDTO } from "./notifications.api";

/** The notices a staff member gets when a Cultural Production task lands on them. */
const STRINGS: Record<string, string> = {
  "notifications:type.cultural_task_assigned.text":
    "You were assigned a task: {taskTitle}.",
  "notifications:type.cultural_task_assigned.textNamed":
    "<profile>{name}</profile> assigned you a task: {taskTitle}.",
  "notifications:type.cultural_task_assigned.meta": "Cultural Production",
  "notifications:type.cultural_task_assigned.taskTitleFallback":
    "open it to see the title",
  "notifications:type.cultural_task_batch_assigned.text":
    "You were assigned the tasks from the {guideTitle} guide.",
  "notifications:type.cultural_task_batch_assigned.textNamed":
    "<profile>{name}</profile> assigned you the tasks from the {guideTitle} guide.",
  "notifications:type.cultural_task_batch_assigned.meta": "Cultural Production",
  "notifications:type.cultural_task_batch_assigned.guideTitleFallback": "event",
};
const t: TFunction = (key: string, values?: TranslateOptions) =>
  interpolate(STRINGS[key] ?? key, values);
const fmt = createFormatters("en");

function dto(overrides: Partial<NotificationDTO>): NotificationDTO {
  return {
    id: "5d8e3f21-6b5c-4a9f-8d32-1e7f8a9b0c2d",
    userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    type: "cultural_task_assigned",
    payload: { taskId: "task-1", taskTitle: "Print the score sheets" },
    read: false,
    createdAt: "2026-11-20T09:00:00.000Z",
    ...overrides,
  };
}

describe("cultural task notifications", () => {
  it("links a task notice to the task drawer", () => {
    expect(
      lifecycleSourceHref("cultural_task_assigned", { taskId: "task/1" }),
    ).toEqual({ href: culturalTaskHref("task/1") });
    expect(notificationDtoToView(dto({}), t, fmt).sourceHref).toBe(
      culturalTaskHref("task-1"),
    );
  });

  it("links a task notice with no id to my tasks", () => {
    expect(lifecycleSourceHref("cultural_task_assigned", {})).toEqual({
      href: CULTURAL_MY_TASKS_HREF,
    });
    expect(
      lifecycleSourceHref("cultural_task_assigned", { taskId: "" }),
    ).toEqual({ href: CULTURAL_MY_TASKS_HREF });
  });

  it("links a batch notice to my tasks", () => {
    expect(
      lifecycleSourceHref("cultural_task_batch_assigned", {
        guideId: "guide-1",
      }),
    ).toEqual({ href: CULTURAL_MY_TASKS_HREF });
    expect(
      notificationDtoToView(
        dto({
          type: "cultural_task_batch_assigned",
          payload: {
            guideId: "guide-1",
            guideTitle: "Quiz night",
            taskCount: 6,
          },
        }),
        t,
        fmt,
      ).sourceHref,
    ).toBe(CULTURAL_MY_TASKS_HREF);
  });

  it("reads the task title into both lines and the fallback when it is missing", () => {
    const task = formatNotification(
      "cultural_task_assigned",
      { taskId: "task-1", taskTitle: "Print the score sheets" },
      t,
      fmt,
    );
    expect(task.text).toBe("You were assigned a task: Print the score sheets.");
    expect(task.meta).toBe("Cultural Production");

    const untitledTask = formatNotification(
      "cultural_task_assigned",
      { taskId: "task-1" },
      t,
      fmt,
    );
    expect(untitledTask.text).toBe(
      "You were assigned a task: open it to see the title.",
    );

    const batch = formatNotification(
      "cultural_task_batch_assigned",
      { guideId: "guide-1", guideTitle: "Quiz night", taskCount: 6 },
      t,
      fmt,
    );
    expect(batch.text).toBe(
      "You were assigned the tasks from the Quiz night guide.",
    );
    expect(batch.meta).toBe("Cultural Production");

    const untitledBatch = formatNotification(
      "cultural_task_batch_assigned",
      { guideId: "guide-1", taskCount: 6 },
      t,
      fmt,
    );
    expect(untitledBatch.text).toBe(
      "You were assigned the tasks from the event guide.",
    );
  });

  it("files both kinds under platform", () => {
    const task = formatNotification("cultural_task_assigned", {}, t, fmt);
    const batch = formatNotification(
      "cultural_task_batch_assigned",
      {},
      t,
      fmt,
    );
    expect(task.category).toBe("platform");
    expect(batch.category).toBe("platform");
    expect(notificationDtoToView(dto({}), t, fmt).type).toBe("platform");
  });

  it("draws the clipboard icon when the assigner is gone", () => {
    const task = notificationDtoToView(dto({}), t, fmt);
    expect(task.icon?.Glyph).toBe(FiClipboard);
    const batch = notificationDtoToView(
      dto({
        type: "cultural_task_batch_assigned",
        payload: { guideId: "guide-1", guideTitle: "Quiz night", taskCount: 6 },
      }),
      t,
      fmt,
    );
    expect(batch.icon?.Glyph).toBe(FiClipboard);
  });
});
