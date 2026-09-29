import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { TFunction } from "../../../shared/i18n/types";
import type { GroupReason } from "../api/goTogether.types";
import { GoTogetherReasonList } from "./GoTogetherReasonList";
import { reasonCopy, tagLabelInSentence } from "./reasonCopy";

/** Stands in for the catalog: every label resolves to `[key]`, so the test
 *  can see which key each tag went through. */
const bracketTranslate: TFunction = (key) => `[${key}]`;

describe("reasonCopy", () => {
  it("maps an interests reason everyone shares to interestsEveryone with the translated tags", () => {
    const reason: GroupReason = {
      kind: "interests",
      tagIds: ["queerHistory", "boardGames"],
      count: 4,
      total: 4,
    };
    expect(reasonCopy(reason, bracketTranslate, "en")).toEqual({
      key: "goTogether:reason.interestsEveryone",
      values: {
        tags: "[goTogether:questionnaire.interests.tag.queerHistory] and [goTogether:questionnaire.interests.tag.boardGames]",
      },
    });
  });

  it("maps an interests reason some share to interestsSome with the count", () => {
    const reason: GroupReason = {
      kind: "interests",
      tagIds: ["queerHistory"],
      count: 3,
      total: 4,
    };
    expect(reasonCopy(reason, bracketTranslate, "en")).toEqual({
      key: "goTogether:reason.interestsSome",
      values: {
        tags: "[goTogether:questionnaire.interests.tag.queerHistory]",
        count: 3,
      },
    });
  });

  it("maps energy by its level", () => {
    for (const level of ["calm", "balanced", "lively"] as const) {
      expect(
        reasonCopy({ kind: "energy", level }, bracketTranslate, "en")?.key,
      ).toBe(`goTogether:reason.energy.${level}`);
    }
  });

  it("passes a host question's prompt and option label through as values", () => {
    const reason: GroupReason = {
      kind: "hostQuestion",
      questionId: "q1",
      optionId: "q1o2",
      prompt: "Tea or coffee?",
      optionLabel: "Tea",
    };
    expect(reasonCopy(reason, bracketTranslate, "en")).toEqual({
      key: "goTogether:reason.hostQuestion",
      values: { option: "Tea", prompt: "Tea or coffee?" },
    });
  });

  it("returns null for a reason kind this client does not know", () => {
    const unknownReason = { kind: "starSign" } as unknown as GroupReason;
    expect(reasonCopy(unknownReason, bracketTranslate, "en")).toBeNull();
  });

  it("keeps the list to the reasons it can phrase", () => {
    const reasons = [
      { kind: "starSign" } as unknown as GroupReason,
      { kind: "energy", level: "calm" } as GroupReason,
    ];
    render(
      createElement(TestProviders, {
        children: createElement(GoTogetherReasonList, { reasons }),
      }),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});

describe("tagLabelInSentence", () => {
  it("drops the first capital of an ordinary label", () => {
    expect(
      tagLabelInSentence("Board games", "interests.boardGames", "en"),
    ).toBe("board games");
    expect(tagLabelInSentence("Hip-hop", "music.hipHop", "en")).toBe("hip-hop");
  });

  it("keeps labels whose second letter is a capital or a symbol", () => {
    expect(tagLabelInSentence("TV series", "interests.tvSeries", "en")).toBe(
      "TV series",
    );
    expect(tagLabelInSentence("R&B", "music.rnb", "en")).toBe("R&B");
    expect(tagLabelInSentence("K-pop", "music.kpop", "en")).toBe("K-pop");
  });

  it("keeps English proper adjectives and lowers the Portuguese ones", () => {
    expect(tagLabelInSentence("Brazilian music", "music.brazilian", "en")).toBe(
      "Brazilian music",
    );
    expect(tagLabelInSentence("Latin", "music.latin", "en")).toBe("Latin");
    expect(
      tagLabelInSentence("Música brasileira", "music.brazilian", "pt"),
    ).toBe("música brasileira");
  });

  it("phrases a reason's tags in sentence case", () => {
    const labels: Record<string, string> = {
      "goTogether:questionnaire.interests.tag.queerHistory": "Queer history",
      "goTogether:questionnaire.interests.tag.tvSeries": "TV series",
    };
    const catalogTranslate: TFunction = (key) => labels[key] ?? key;
    const reason: GroupReason = {
      kind: "interests",
      tagIds: ["queerHistory", "tvSeries"],
      count: 4,
      total: 4,
    };
    expect(reasonCopy(reason, catalogTranslate, "en")?.values.tags).toBe(
      "queer history and TV series",
    );
  });
});
