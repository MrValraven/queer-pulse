import { describe, expect, it } from "vitest";
import type { CulturalGuideDTO } from "./api/culturalProduction.types";
import {
  bodyFromDraft,
  draftFromGuide,
  guideDraftReducer,
  isDraftChanged,
  localIssuesOf,
  refusalOfIssue,
  refusalTargetOf,
} from "./guideEditor.model";

const STORED_GUIDE: CulturalGuideDTO = {
  id: "guide-film",
  title: "Film night",
  eventType: "film_night",
  locale: "en",
  summary: "How we run a film night",
  sectionCount: 2,
  stepCount: 3,
  author: null,
  updatedBy: null,
  createdAt: "2026-11-01T10:00:00.000Z",
  updatedAt: "2026-11-01T10:00:00.000Z",
  canDelete: true,
  revision: 4,
  sections: [
    {
      id: "section-venue",
      heading: "Venue",
      body: "A room with a projector",
      steps: [
        { id: "step-book", text: "Book the venue", daysBefore: 30 },
        { id: "step-test", text: "Test the projector", daysBefore: 2 },
        { id: "step-thank", text: "Thank the venue", daysBefore: -1 },
      ],
    },
    {
      id: "section-film",
      heading: "The film",
      body: "",
      steps: [],
    },
  ],
};

describe("guideEditor.model", () => {
  it("builds the replace body with the revision and the ids it was given", () => {
    const draft = guideDraftReducer(draftFromGuide(STORED_GUIDE), {
      type: "addSection",
      key: "draft-new",
    });
    const named = guideDraftReducer(draft, {
      type: "updateSection",
      sectionIndex: 2,
      changes: { heading: "Wrap-up" },
    });
    const withStep = guideDraftReducer(
      guideDraftReducer(named, {
        type: "addStep",
        sectionIndex: 2,
        key: "draft-step",
      }),
      {
        type: "updateStep",
        sectionIndex: 2,
        stepIndex: 0,
        changes: { text: "Share the photos", daysText: "" },
      },
    );

    const body = bodyFromDraft(withStep, STORED_GUIDE.revision);

    expect(body.revision).toBe(4);
    expect(body.title).toBe("Film night");
    expect(body.sections.map((section) => section.id)).toEqual([
      "section-venue",
      "section-film",
      undefined,
    ]);
    expect(body.sections[0]?.steps.map((step) => step.id)).toEqual([
      "step-book",
      "step-test",
      "step-thank",
    ]);
    expect(body.sections[0]?.steps[2]?.daysBefore).toBe(-1);
    expect(body.sections[2]).toEqual({
      heading: "Wrap-up",
      body: "",
      steps: [{ text: "Share the photos", daysBefore: null }],
    });
  });

  it("moves a step within its section", () => {
    const draft = draftFromGuide(STORED_GUIDE);

    const movedDown = guideDraftReducer(draft, {
      type: "moveStep",
      sectionIndex: 0,
      stepIndex: 0,
      direction: "down",
    });
    const movedPastTheTop = guideDraftReducer(movedDown, {
      type: "moveStep",
      sectionIndex: 0,
      stepIndex: 0,
      direction: "up",
    });

    expect(movedDown.sections[0]?.steps.map((step) => step.id)).toEqual([
      "step-test",
      "step-book",
      "step-thank",
    ]);
    expect(movedDown.sections[1]).toBe(draft.sections[1]);
    expect(movedPastTheTop.sections[0]?.steps.map((step) => step.id)).toEqual([
      "step-test",
      "step-book",
      "step-thank",
    ]);
  });

  it("flags a heading over 120 characters with the server's code and index", () => {
    const draft = guideDraftReducer(draftFromGuide(STORED_GUIDE), {
      type: "updateSection",
      sectionIndex: 1,
      changes: { heading: "a".repeat(121) },
    });

    const issues = localIssuesOf(draft);

    expect(issues).toEqual([
      {
        code: "CULTURAL_GUIDE_HEADING_TOO_LONG",
        sectionIndex: 1,
        stepIndex: null,
      },
    ]);
    const firstIssue = issues[0];
    if (firstIssue === undefined) throw new Error("No issue was flagged");
    expect(refusalTargetOf(refusalOfIssue(firstIssue), draft)).toEqual({
      field: "heading",
      sectionIndex: 1,
      stepIndex: null,
    });
    expect(
      localIssuesOf(
        guideDraftReducer(draft, {
          type: "updateSection",
          sectionIndex: 1,
          changes: { heading: "a".repeat(120) },
        }),
      ),
    ).toEqual([]);
  });

  it("flags days out of range on the step that holds them", () => {
    const draft = guideDraftReducer(draftFromGuide(STORED_GUIDE), {
      type: "updateStep",
      sectionIndex: 0,
      stepIndex: 1,
      changes: { daysText: "400" },
    });

    expect(localIssuesOf(draft)).toEqual([
      {
        code: "CULTURAL_GUIDE_STEP_DAYS_INVALID",
        sectionIndex: 0,
        stepIndex: 1,
      },
    ]);
  });

  it("sees no change on an untouched draft", () => {
    const draft = draftFromGuide(STORED_GUIDE);

    expect(isDraftChanged(draft, STORED_GUIDE)).toBe(false);
    expect(localIssuesOf(draft)).toEqual([]);
    expect(
      isDraftChanged(
        guideDraftReducer(draft, {
          type: "setMeta",
          meta: { summary: "How we run a film night together" },
        }),
        STORED_GUIDE,
      ),
    ).toBe(true);
  });
});
