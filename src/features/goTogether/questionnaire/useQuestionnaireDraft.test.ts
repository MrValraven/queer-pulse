import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  INTEREST_TAG_IDS,
  MAX_INTEREST_TAGS,
  type FriendMatchAnswers,
} from "../goTogetherQuestionnaire.data";
import {
  clearQuestionnaireDrafts,
  questionnaireDraftKey,
} from "./questionnaireDraftStorage";
import { QUESTIONNAIRE_STEPS } from "./questionnaireSteps.data";
import { useQuestionnaireDraft } from "./useQuestionnaireDraft";

const COMPLETE_ANSWERS: FriendMatchAnswers = {
  values: {
    community: 5,
    creativity: 4,
    family: 3,
    fun: 4,
    career: 2,
    spirituality: 1,
  },
  humour: { h1: "a", h2: "b", h3: "a", h4: "b" },
  interests: ["boardGames", "queerHistory"],
  music: ["pop", "fado"],
  energy: { talker: 2, nightShape: 3, planner: 4 },
  intent: "both",
  meetFrequency: "monthly",
  languages: ["pt", "en"],
  drinking: "eitherWay",
  ageBracket: "25-34",
  agePreference: "any",
  area: "Arroios",
};

/** The backend's `FriendMatchAnswers` keys, in its declaration order. */
const ANSWER_KEYS = [
  "values",
  "humour",
  "interests",
  "music",
  "energy",
  "intent",
  "meetFrequency",
  "languages",
  "drinking",
  "ageBracket",
  "agePreference",
  "area",
];

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("useQuestionnaireDraft", () => {
  it("starts invalid on every required step", () => {
    const { result } = renderHook(() => useQuestionnaireDraft());
    const requiredSteps = QUESTIONNAIRE_STEPS.filter((step) => step.isRequired);

    expect(requiredSteps.length).toBeGreaterThan(0);
    for (const step of requiredSteps) {
      expect(result.current.isStepComplete(step.id)).toBe(false);
    }
    expect(result.current.toAnswers()).toBeNull();
  });

  it("makes each step valid once its block is filled", () => {
    const { result } = renderHook(() => useQuestionnaireDraft());

    act(() => {
      result.current.setValueScore("community", 5);
      result.current.setValueScore("creativity", 4);
      result.current.setValueScore("family", 3);
      result.current.setValueScore("fun", 4);
      result.current.setValueScore("career", 2);
    });
    expect(result.current.isStepComplete("values")).toBe(false);
    act(() => result.current.setValueScore("spirituality", 1));
    expect(result.current.isStepComplete("values")).toBe(true);

    act(() => {
      result.current.setHumourPick("h1", "a");
      result.current.setHumourPick("h2", "b");
      result.current.setHumourPick("h3", "a");
      result.current.setHumourPick("h4", "b");
    });
    expect(result.current.isStepComplete("humour")).toBe(true);

    act(() => result.current.toggleTag("interests", "boardGames"));
    expect(result.current.isStepComplete("interests")).toBe(true);

    expect(result.current.isStepComplete("music")).toBe(true);

    act(() => {
      result.current.setEnergyScore("talker", 2);
      result.current.setEnergyScore("nightShape", 3);
      result.current.setEnergyScore("planner", 4);
    });
    expect(result.current.isStepComplete("energy")).toBe(true);

    act(() => result.current.setChoice("intent", "both"));
    expect(result.current.isStepComplete("intent")).toBe(false);
    act(() => result.current.setChoice("meetFrequency", "weekly"));
    expect(result.current.isStepComplete("intent")).toBe(true);

    act(() => {
      result.current.toggleTag("languages", "pt");
      result.current.setChoice("drinking", "soberGroup");
      result.current.setChoice("ageBracket", "35-44");
    });
    expect(result.current.isStepComplete("dealbreakers")).toBe(false);
    act(() => result.current.setChoice("agePreference", "similar"));
    expect(result.current.isStepComplete("dealbreakers")).toBe(true);

    expect(result.current.isStepComplete("area")).toBe(true);

    expect(result.current.isStepComplete("consent")).toBe(false);
    act(() => result.current.setHasConsented(true));
    expect(result.current.isStepComplete("consent")).toBe(true);
  });

  it("refuses a ninth interest pick", () => {
    const { result } = renderHook(() => useQuestionnaireDraft());
    const nineTags = INTEREST_TAG_IDS.slice(0, MAX_INTEREST_TAGS + 1);

    act(() => {
      for (const tagId of nineTags) {
        result.current.toggleTag("interests", tagId);
      }
    });

    expect(result.current.draft.interests).toHaveLength(MAX_INTEREST_TAGS);
    expect(result.current.draft.interests).not.toContain(
      nineTags[MAX_INTEREST_TAGS],
    );

    act(() => result.current.toggleTag("interests", nineTags[0]!));
    expect(result.current.draft.interests).toHaveLength(MAX_INTEREST_TAGS - 1);
  });

  it("prefills languages from the viewer's profile languages", () => {
    const { result } = renderHook(() =>
      useQuestionnaireDraft({ profileLanguages: ["PT", "EN", "Klingon"] }),
    );

    expect(result.current.draft.languages).toEqual(["pt", "en"]);
  });

  it("keeps saved languages over the profile languages", () => {
    const { result } = renderHook(() =>
      useQuestionnaireDraft({
        initialAnswers: { ...COMPLETE_ANSWERS, languages: ["es"] },
        profileLanguages: ["PT"],
      }),
    );

    expect(result.current.draft.languages).toEqual(["es"]);
  });

  it("returns the exact backend answer shape, with area null when skipped", () => {
    const { result } = renderHook(() =>
      useQuestionnaireDraft({ initialAnswers: COMPLETE_ANSWERS }),
    );

    act(() => result.current.setChoice("area", null));
    const answers = result.current.toAnswers();

    expect(answers).not.toBeNull();
    expect(Object.keys(answers ?? {}).sort()).toEqual([...ANSWER_KEYS].sort());
    expect(answers).toEqual({ ...COMPLETE_ANSWERS, area: null });
  });

  it("restores the draft after a reload but asks for consent again", () => {
    const firstVisit = renderHook(() => useQuestionnaireDraft());
    act(() => {
      firstVisit.result.current.setValueScore("fun", 5);
      firstVisit.result.current.setStepIndex(2);
      firstVisit.result.current.setHasConsented(true);
    });
    firstVisit.unmount();

    const secondVisit = renderHook(() => useQuestionnaireDraft());

    expect(secondVisit.result.current.draft.values.fun).toBe(5);
    expect(secondVisit.result.current.stepIndex).toBe(2);
    expect(secondVisit.result.current.hasConsented).toBe(false);
  });

  it("stops restoring once the saved draft is cleared", () => {
    const firstVisit = renderHook(() => useQuestionnaireDraft());
    act(() => firstVisit.result.current.setValueScore("fun", 5));
    act(() => firstVisit.result.current.clearSavedDraft());
    firstVisit.unmount();

    const secondVisit = renderHook(() => useQuestionnaireDraft());

    expect(secondVisit.result.current.draft.values.fun).toBeUndefined();
  });

  it("leaves untouched saved answers out of storage, even across steps", () => {
    const { result } = renderHook(() =>
      useQuestionnaireDraft({ initialAnswers: COMPLETE_ANSWERS }),
    );

    act(() => result.current.setStepIndex(3));

    expect(result.current.stepIndex).toBe(3);
    expect(
      window.sessionStorage.getItem(questionnaireDraftKey(null)),
    ).toBeNull();
  });

  it("keeps each member's draft under their own key", () => {
    const firstMember = renderHook(() =>
      useQuestionnaireDraft({ storageKey: questionnaireDraftKey("member-a") }),
    );
    act(() => firstMember.result.current.setValueScore("fun", 5));
    firstMember.unmount();

    const secondMember = renderHook(() =>
      useQuestionnaireDraft({ storageKey: questionnaireDraftKey("member-b") }),
    );
    const firstMemberAgain = renderHook(() =>
      useQuestionnaireDraft({ storageKey: questionnaireDraftKey("member-a") }),
    );

    expect(secondMember.result.current.draft.values.fun).toBeUndefined();
    expect(firstMemberAgain.result.current.draft.values.fun).toBe(5);
  });

  it("forgets every member's draft on clearQuestionnaireDrafts", () => {
    for (const memberId of ["member-a", "member-b", null]) {
      const visit = renderHook(() =>
        useQuestionnaireDraft({ storageKey: questionnaireDraftKey(memberId) }),
      );
      act(() => visit.result.current.setValueScore("fun", 5));
      visit.unmount();
    }
    window.sessionStorage.setItem("unrelated", "kept");

    clearQuestionnaireDrafts();

    expect(
      window.sessionStorage.getItem(questionnaireDraftKey("member-a")),
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(questionnaireDraftKey("member-b")),
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(questionnaireDraftKey(null)),
    ).toBeNull();
    expect(window.sessionStorage.getItem("unrelated")).toBe("kept");
  });
});
