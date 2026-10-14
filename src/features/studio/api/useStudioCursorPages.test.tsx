import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { StudioPageDTO } from "./studio.types";
import { useStudioCursorPages } from "./useStudioCursorPages";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

const pages: Record<"first" | "second", StudioPageDTO<number>> = {
  first: {
    items: [1, 2],
    pageInfo: { hasMore: true, nextCursor: "second" },
  },
  second: {
    items: [3],
    pageInfo: { hasMore: false, nextCursor: null },
  },
};

describe("useStudioCursorPages", () => {
  it("maps hasMore from the page info and flattens the pages", async () => {
    const { result } = renderHook(
      () =>
        useStudioCursorPages({
          queryKey: ["studio", "cursor-pages-test"],
          enabled: true,
          read: (cursor) =>
            Promise.resolve(cursor === "second" ? pages.second : pages.first),
          toView: (value: number) => `n${value}`,
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.items).toEqual(["n1", "n2"]));
    expect(result.current.hasMore).toBe(true);
    act(() => result.current.fetchNextPage());
    await waitFor(() =>
      expect(result.current.items).toEqual(["n1", "n2", "n3"]),
    );
    expect(result.current.hasMore).toBe(false);
  });
});
