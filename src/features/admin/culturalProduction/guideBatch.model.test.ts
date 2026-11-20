import { beforeEach, describe, expect, it } from "vitest";
import type { CulturalGuideDTO } from "./api/culturalProduction.types";
import {
  demoCreateCulturalTaskBatch,
  demoGetCulturalGuide,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { DEMO_CULTURAL_VIEWER_ID } from "./culturalProductionDemoViewer";
import {
  CULTURAL_MY_TASKS_HREF,
  culturalTabHref,
} from "./culturalProductionPaths";
import {
  createdTasksHrefOf,
  guideStepsOf,
  previewGuideBatch,
} from "./guideBatch.model";

const QUIZ_GUIDE_EN_ID = "demo-guide-quiz-en";

/** A small guide: steps 10 days before, on the day, any time, a day after. */
const SMALL_GUIDE: Pick<CulturalGuideDTO, "sections"> = {
  sections: [
    {
      id: "section-one",
      heading: "Before",
      body: "",
      steps: [
        { id: "step-book", text: "Book the space", daysBefore: 10 },
        { id: "step-doors", text: "Open the doors", daysBefore: 0 },
      ],
    },
    {
      id: "section-two",
      heading: "After",
      body: "",
      steps: [
        { id: "step-photos", text: "Share the photos", daysBefore: null },
        { id: "step-thanks", text: "Thank the hosts", daysBefore: -1 },
      ],
    },
  ],
};

beforeEach(() => {
  resetDemoCulturalProduction();
});

describe("previewGuideBatch", () => {
  it("previews one row per step with the same due dates the store creates", () => {
    const eventOn = "2027-03-20";
    const guide = demoGetCulturalGuide(QUIZ_GUIDE_EN_ID);
    const preview = previewGuideBatch(guide, eventOn, "2026-11-20");
    const batch = demoCreateCulturalTaskBatch(QUIZ_GUIDE_EN_ID, { eventOn });

    expect(preview.rows).toHaveLength(18);
    expect(preview.rows).toHaveLength(batch.items.length);
    expect(preview.rows.map((row) => row.stepId)).toEqual(
      guideStepsOf(guide).map((step) => step.id),
    );
    expect(preview.rows.map((row) => row.text)).toEqual(
      batch.items.map((task) => task.title),
    );
    expect(preview.rows.map((row) => row.dueOn)).toEqual(
      batch.items.map((task) => task.dueOn),
    );
    expect(preview.rows[0]?.dueOn).toBe("2027-02-06");
    expect(preview.rows.at(-1)?.dueOn).toBe("2027-03-23");
    expect(preview.pastCount).toBe(0);
  });

  it("counts steps already past", () => {
    const preview = previewGuideBatch(SMALL_GUIDE, "2026-11-25", "2026-11-20");

    expect(preview.rows).toEqual([
      {
        stepId: "step-book",
        text: "Book the space",
        dueOn: "2026-11-15",
        isPast: true,
      },
      {
        stepId: "step-doors",
        text: "Open the doors",
        dueOn: "2026-11-25",
        isPast: false,
      },
      {
        stepId: "step-photos",
        text: "Share the photos",
        dueOn: null,
        isPast: false,
      },
      {
        stepId: "step-thanks",
        text: "Thank the hosts",
        dueOn: "2026-11-26",
        isPast: false,
      },
    ]);
    expect(preview.pastCount).toBe(1);
  });

  it("reads a step due today as current and every dated step as past for an old event", () => {
    expect(
      previewGuideBatch(SMALL_GUIDE, "2026-11-30", "2026-11-20").pastCount,
    ).toBe(0);
    const oldEvent = previewGuideBatch(SMALL_GUIDE, "2026-11-01", "2026-11-20");
    expect(oldEvent.pastCount).toBe(3);
    expect(oldEvent.rows.map((row) => row.isPast)).toEqual([
      true,
      true,
      false,
      true,
    ]);
  });
});

describe("createdTasksHrefOf", () => {
  it("opens the viewer's own tasks when the viewer is among the assignees", () => {
    expect(
      createdTasksHrefOf(
        ["demo-cp-nuno", DEMO_CULTURAL_VIEWER_ID],
        DEMO_CULTURAL_VIEWER_ID,
      ),
    ).toBe(CULTURAL_MY_TASKS_HREF);
  });

  it("opens the Tasks tab when the viewer is no assignee", () => {
    expect(createdTasksHrefOf(["demo-cp-nuno"], DEMO_CULTURAL_VIEWER_ID)).toBe(
      culturalTabHref("tasks"),
    );
    expect(createdTasksHrefOf([], null)).toBe(culturalTabHref("tasks"));
  });
});
