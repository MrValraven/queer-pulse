import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FORUM_TAG_OPTIONS } from "../forumTags.data";
import {
  COMPOSE_CALL_MEMBER_TAG_LIMIT,
  COMPOSE_TAG_LIMIT,
} from "./composeThread.types";
import { useComposeThreadState } from "./useComposeThreadState";

describe("useComposeThreadState funding rules", () => {
  it("files an open call under Funding & Grants and opens its fields", () => {
    const { result } = renderHook(() =>
      useComposeThreadState({ category: "housing" }),
    );
    act(() => result.current.setters.setKind("call"));
    expect(result.current.core.category).toBe("funding");
    expect(result.current.core.funding).not.toBeNull();
  });

  it("drops the call kind when the member files elsewhere, and keeps what they typed", () => {
    const { result } = renderHook(() => useComposeThreadState());
    act(() => result.current.setters.setKind("call"));
    act(() => result.current.setters.setFunding({ funderName: "Maré" }));
    act(() => result.current.setters.setCategory("arts"));
    expect(result.current.core.kind).toBeNull();
    expect(result.current.core.funding?.funderName).toBe("Maré");
  });

  it("keeps a fundraiser signed", () => {
    const { result } = renderHook(() => useComposeThreadState());
    act(() => result.current.setters.setKind("question"));
    act(() => result.current.setters.setCategory("funding"));
    act(() => result.current.setters.setIsAnonymous(true));
    expect(result.current.core.isAnonymous).toBe(true);
    act(() => result.current.setters.setKind("ask"));
    expect(result.current.core.isAnonymous).toBe(false);
    act(() => result.current.setters.setIsAnonymous(true));
    expect(result.current.core.isAnonymous).toBe(false);
  });

  it("toggles an eligibility value on and off", () => {
    const { result } = renderHook(() => useComposeThreadState());
    act(() => result.current.setters.setKind("call"));
    act(() => result.current.setters.toggleFundingEligibility("students"));
    expect(result.current.core.funding?.eligibility).toEqual(["students"]);
    act(() => result.current.setters.toggleFundingEligibility("students"));
    expect(result.current.core.funding?.eligibility).toEqual([]);
  });

  it("lets a call's author pick four tags, since the server puts open-call first", () => {
    const { result } = renderHook(() => useComposeThreadState());
    act(() => result.current.setters.setKind("call"));
    const memberTags = FORUM_TAG_OPTIONS.slice(0, COMPOSE_TAG_LIMIT);
    for (const tag of memberTags) {
      act(() => result.current.setters.addTag(tag));
    }
    expect(result.current.core.tags).toEqual(
      memberTags.slice(0, COMPOSE_CALL_MEMBER_TAG_LIMIT),
    );
  });

  it("keeps the full five tags for every other kind", () => {
    const { result } = renderHook(() => useComposeThreadState());
    act(() => result.current.setters.setKind("question"));
    const memberTags = FORUM_TAG_OPTIONS.slice(0, COMPOSE_TAG_LIMIT);
    for (const tag of memberTags) {
      act(() => result.current.setters.addTag(tag));
    }
    expect(result.current.core.tags).toEqual(memberTags);
  });

  it("trims the member's tags to four when the kind turns into a call", () => {
    const memberTags = FORUM_TAG_OPTIONS.slice(0, COMPOSE_TAG_LIMIT);
    const { result } = renderHook(() =>
      useComposeThreadState({ tags: [...memberTags] }),
    );
    expect(result.current.core.tags).toHaveLength(COMPOSE_TAG_LIMIT);
    act(() => result.current.setters.setKind("call"));
    expect(result.current.core.tags).toEqual(
      memberTags.slice(0, COMPOSE_CALL_MEMBER_TAG_LIMIT),
    );
  });
});
