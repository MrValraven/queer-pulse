import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import { useReaderComments } from "./useReaderComments";
import { DEMO_READER_COMMENTS } from "./readerComments.data";

function wrapper({ children }: { children: ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

describe("useReaderComments (demo mode)", () => {
  it("returns the static demo fixture with no network", async () => {
    const { result } = renderHook(() => useReaderComments("any-slug"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.comments).toEqual(DEMO_READER_COMMENTS);
    expect(result.current.total).toBe(DEMO_READER_COMMENTS.length);
  });
});
