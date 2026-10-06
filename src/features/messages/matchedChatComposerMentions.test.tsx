import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  buildMatchedChatComposerMentions,
  MatchedChatComposerMentionsContext,
  useDisplayMaxLength,
  useStoredMessageBody,
} from "./matchedChatComposerMentions";
import { getMessageBodyLength } from "./messageBodyLimit";

const SOFIA = "m-2f8b6d1a4c93e75b0d6a2f19";

describe("useStoredMessageBody (PRD-423, item 13)", () => {
  it("measures a matched chat body by its stored key-token form", () => {
    const mentions = buildMatchedChatComposerMentions([
      { slug: SOFIA, name: "Sofia" },
    ]);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MatchedChatComposerMentionsContext.Provider value={mentions}>
        {children}
      </MatchedChatComposerMentionsContext.Provider>
    );

    const { result } = renderHook(() => useStoredMessageBody("hi @Sofia"), {
      wrapper,
    });

    expect(result.current).toBe(`hi @${SOFIA}`);
    expect(getMessageBodyLength(result.current)).toBeGreaterThan(
      getMessageBodyLength("hi @Sofia"),
    );
  });

  it("leaves every other chat's body as typed", () => {
    const { result } = renderHook(() => useStoredMessageBody("hi @Sofia"));

    expect(result.current).toBe("hi @Sofia");
  });
});

describe("useDisplayMaxLength (PRD-423, captions)", () => {
  it("shrinks a matched chat caption cap by what its mentions grow when stored", () => {
    const mentions = buildMatchedChatComposerMentions([
      { slug: SOFIA, name: "Sofia" },
    ]);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MatchedChatComposerMentionsContext.Provider value={mentions}>
        {children}
      </MatchedChatComposerMentionsContext.Provider>
    );

    const { result } = renderHook(
      () => useDisplayMaxLength("for @Sofia", 1000),
      { wrapper },
    );

    expect(result.current).toBe(
      1000 - (`for @${SOFIA}`.length - "for @Sofia".length),
    );
  });

  it("keeps the full cap outside a matched chat", () => {
    const { result } = renderHook(() =>
      useDisplayMaxLength("for @Sofia", 1000),
    );

    expect(result.current).toBe(1000);
  });
});
