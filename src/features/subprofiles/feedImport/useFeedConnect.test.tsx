import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { resetDemoFeedsForTests } from "../data/subprofileFeedsDemo";
import { demoPodcastView } from "./feedImportTestData";
import { useFeedConnect } from "./useFeedConnect";

// A lookup that takes a moment to answer, so an edit can land while it is out.
const lookup = { delayMs: 0 };
vi.mock("../api/useSubprofileFeeds", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/useSubprofileFeeds")>();
  return {
    ...actual,
    loadDemoFeeds: async () => {
      if (lookup.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, lookup.delayMs));
      }
      return actual.loadDemoFeeds();
    },
  };
});

beforeEach(resetDemoFeedsForTests);
afterEach(() => {
  lookup.delayMs = 0;
  resetDemoFeedsForTests();
});

describe("useFeedConnect stale lookups", () => {
  it("drops a lookup still in flight when the address changes", async () => {
    lookup.delayMs = 120;
    const { result } = renderHook(() => useFeedConnect(demoPodcastView()), {
      wrapper: TestProviders,
    });
    act(() => result.current.setUrl("https://old.example.com/rss"));
    act(() => result.current.lookUp());
    await waitFor(() => expect(result.current.isLookingUp).toBe(true));

    // The member edits the address before the old lookup has answered.
    act(() => result.current.setUrl("https://new.example.com/rss"));
    expect(result.current.isLookingUp).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 250));
    // The old answer never becomes a preview that Connect could act on.
    expect(result.current.previewed).toBeUndefined();
  });

  it("still shows the lookup of the address that stands", async () => {
    const { result } = renderHook(() => useFeedConnect(demoPodcastView()), {
      wrapper: TestProviders,
    });
    act(() => result.current.setUrl("https://new.example.com/rss"));
    act(() => result.current.lookUp());
    await waitFor(() =>
      expect(result.current.previewed?.feedUrl).toBe(
        "https://new.example.com/rss",
      ),
    );
  });
});
