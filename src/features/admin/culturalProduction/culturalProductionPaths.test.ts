import { describe, expect, it } from "vitest";
import { CULTURAL_PRODUCTION_NAV_TO } from "../../../shared/components/layout/adminNav.data";
import {
  CULTURAL_MY_TASKS_HREF,
  culturalGuidePath,
  culturalIdeaHref,
  culturalTabHref,
  culturalTaskHref,
} from "./culturalProductionPaths";

const MY_TASKS = "/admin/cultural-production?tab=tasks&assignedTo=me";

describe("culturalProductionPaths", () => {
  it("answers the bare route for the ideas tab", () => {
    expect(culturalTabHref("ideas")).toBe("/admin/cultural-production");
    expect(culturalTabHref("tasks")).toBe(
      "/admin/cultural-production?tab=tasks",
    );
    expect(culturalTabHref("guides")).toBe(
      "/admin/cultural-production?tab=guides",
    );
  });

  it("opens an idea and a task with the id encoded", () => {
    expect(culturalIdeaHref("idea 1/2")).toBe(
      "/admin/cultural-production?tab=ideas&idea=idea%201%2F2",
    );
    expect(culturalTaskHref("task&3")).toBe(
      "/admin/cultural-production?tab=tasks&task=task%263",
    );
  });

  it("builds a guide page path with the id encoded", () => {
    expect(culturalGuidePath("guide/9")).toBe(
      "/admin/cultural-production/guides/guide%2F9",
    );
  });

  it("pins the my tasks link and the nav item to the same string", () => {
    expect(CULTURAL_MY_TASKS_HREF).toBe(MY_TASKS);
    expect(CULTURAL_PRODUCTION_NAV_TO).toBe(MY_TASKS);
  });
});
