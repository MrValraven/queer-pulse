import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FundingAskState } from "./funding.types";
import { useAskSentBack } from "./useAskSentBack";

type Props = { slug: string; askState: FundingAskState | null };

const render = (initialProps: Props) =>
  renderHook((props: Props) => useAskSentBack(props.slug, props.askState), {
    initialProps,
  });

describe("useAskSentBack", () => {
  it("stays quiet for a fundraiser that was pending from the start", () => {
    const { result } = render({ slug: "a", askState: "pending" });
    expect(result.current).toBe(false);
  });

  it("notices an approved fundraiser going back to review on screen", () => {
    const { result, rerender } = render({ slug: "a", askState: "active" });
    rerender({ slug: "a", askState: "pending" });
    expect(result.current).toBe(true);
    rerender({ slug: "a", askState: "active" });
    expect(result.current).toBe(false);
  });

  it("forgets it on another thread", () => {
    const { result, rerender } = render({ slug: "a", askState: "active" });
    rerender({ slug: "a", askState: "pending" });
    rerender({ slug: "b", askState: "pending" });
    expect(result.current).toBe(false);
  });
});
