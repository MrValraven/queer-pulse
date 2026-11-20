import { describe, expect, it } from "vitest";
import {
  CULTURAL_IDEA_DESCRIPTION_MAX,
  CULTURAL_REASON_CODES,
  CULTURAL_TITLE_MAX,
  culturalReasonOf,
  type CulturalIdeaDTO,
} from "./api/culturalProduction.types";
import {
  changedIdeaFieldsOf,
  createIdeaBodyOf,
  emptyIdeaFormValues,
  fieldOfCulturalReason,
  ideaFormValuesOf,
  localIdeaReasonOf,
  localIdeaRefusal,
  shouldShowCharacterCount,
  shownIdeaFormValuesOf,
  updateIdeaBodyOf,
} from "./ideaForm.model";

const STORED_IDEA: CulturalIdeaDTO = {
  id: "idea-1",
  title: "Drag bingo",
  description: "A drag host calls the numbers",
  eventType: "party",
  status: "exploring",
  author: null,
  createdAt: "2026-11-14T10:00:00.000Z",
  updatedAt: "2026-11-14T10:00:00.000Z",
  backers: [],
  backerCount: 0,
  isBackedByMe: false,
  commentCount: 0,
  linkedTaskCount: 0,
  openLinkedTaskCount: 0,
  canDelete: true,
  comments: [],
  linkedTasks: [],
};

describe("ideaForm.model", () => {
  it("maps each field code to its field and others to the form", () => {
    expect(fieldOfCulturalReason("CULTURAL_TITLE_REQUIRED")).toBe("title");
    expect(fieldOfCulturalReason("CULTURAL_TITLE_TOO_LONG")).toBe("title");
    expect(fieldOfCulturalReason("CULTURAL_DESCRIPTION_TOO_LONG")).toBe(
      "description",
    );
    expect(fieldOfCulturalReason("CULTURAL_EVENT_TYPE_INVALID")).toBe(
      "eventType",
    );
    expect(fieldOfCulturalReason("CULTURAL_IDEA_STATUS_INVALID")).toBe(
      "status",
    );
    const fieldCodes = new Set([
      "CULTURAL_TITLE_REQUIRED",
      "CULTURAL_TITLE_TOO_LONG",
      "CULTURAL_DESCRIPTION_TOO_LONG",
      "CULTURAL_EVENT_TYPE_INVALID",
      "CULTURAL_IDEA_STATUS_INVALID",
    ]);
    CULTURAL_REASON_CODES.filter((code) => !fieldCodes.has(code)).forEach(
      (code) => expect(fieldOfCulturalReason(code)).toBeNull(),
    );
    expect(fieldOfCulturalReason(null)).toBeNull();
  });

  it("checks the title first, then the description, then the event type", () => {
    const blank = emptyIdeaFormValues();
    expect(localIdeaReasonOf(blank)).toBe("CULTURAL_TITLE_REQUIRED");
    expect(localIdeaReasonOf({ ...blank, title: "   " })).toBe(
      "CULTURAL_TITLE_REQUIRED",
    );
    expect(
      localIdeaReasonOf({
        ...blank,
        title: "a".repeat(CULTURAL_TITLE_MAX + 1),
      }),
    ).toBe("CULTURAL_TITLE_TOO_LONG");
    expect(
      localIdeaReasonOf({
        ...blank,
        title: "Quiz",
        description: "b".repeat(CULTURAL_IDEA_DESCRIPTION_MAX + 1),
      }),
    ).toBe("CULTURAL_DESCRIPTION_TOO_LONG");
    expect(localIdeaReasonOf({ ...blank, title: "Quiz" })).toBe(
      "CULTURAL_EVENT_TYPE_INVALID",
    );
    expect(
      localIdeaReasonOf({ ...blank, title: "Quiz", eventType: "quiz_night" }),
    ).toBeNull();
  });

  it("builds a local refusal the shared reader names", () => {
    expect(culturalReasonOf(localIdeaRefusal("CULTURAL_TITLE_REQUIRED"))).toBe(
      "CULTURAL_TITLE_REQUIRED",
    );
  });

  it("shows the counter from 80 percent of the limit", () => {
    expect(shouldShowCharacterCount(3199, 4000)).toBe(false);
    expect(shouldShowCharacterCount(3200, 4000)).toBe(true);
  });

  it("trims the create body and sends only touched fields on edit", () => {
    expect(
      createIdeaBodyOf({
        ...emptyIdeaFormValues(),
        title: "  Quiz night  ",
        description: " Music round ",
        eventType: "quiz_night",
      }),
    ).toEqual({
      title: "Quiz night",
      description: "Music round",
      eventType: "quiz_night",
    });
    expect(
      updateIdeaBodyOf(
        {
          title: "Drag bingo",
          description: "A drag host calls the numbers",
          eventType: "party",
          status: "planned",
        },
        new Set(["status"]),
        STORED_IDEA,
      ),
    ).toEqual({ status: "planned" });
  });

  it("keeps a teammate's newer save to a field this form never touched", () => {
    const openedValues = ideaFormValuesOf(STORED_IDEA);
    const typedValues = { ...openedValues, status: "planned" as const };
    const touchedFields = new Set(
      changedIdeaFieldsOf(openedValues, typedValues),
    );
    expect([...touchedFields]).toEqual(["status"]);
    const refetchedIdea: CulturalIdeaDTO = {
      ...STORED_IDEA,
      title: "Drag bingo night in Anjos",
      eventType: "music_night",
    };
    const shownValues = shownIdeaFormValuesOf(
      typedValues,
      touchedFields,
      refetchedIdea,
    );
    expect(shownValues).toEqual({
      title: "Drag bingo night in Anjos",
      description: "A drag host calls the numbers",
      eventType: "music_night",
      status: "planned",
    });
    expect(
      updateIdeaBodyOf(
        { ...typedValues, eventType: "party" },
        touchedFields,
        refetchedIdea,
      ),
    ).toEqual({ status: "planned" });
    expect(
      updateIdeaBodyOf(
        { ...shownValues, eventType: "music_night" },
        new Set(["title"]),
        refetchedIdea,
      ),
    ).toEqual({});
  });
});
