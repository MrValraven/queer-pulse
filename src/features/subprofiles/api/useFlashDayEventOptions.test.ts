import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { INITIAL_EVENTS } from "../../myevents/myEvents.mock";
import type { FlashDayEventRef } from "./subprofiles.api";
import {
  buildDemoFlashDayEventOptions,
  compareFlashDayEventRefs,
  useFlashDayEventOptions,
} from "./useFlashDayEventOptions";

const getFlashDayEventOptionsMock = vi.hoisted(() => vi.fn());

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("./subprofiles.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./subprofiles.api")>()),
  getFlashDayEventOptions: getFlashDayEventOptionsMock,
}));

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function makeRef(slug: string, startsAt: number): FlashDayEventRef {
  return {
    slug,
    title: slug,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: null,
    venue: null,
    neighbourhood: null,
    isOnline: false,
    imageUrl: null,
  };
}

describe("buildDemoFlashDayEventOptions", () => {
  it("lists the demo member's hosted events and leaves going RSVPs out", async () => {
    const options = await buildDemoFlashDayEventOptions();
    const slugs = options.map((option) => option.slug);
    expect(slugs).toContain("trans-joy-picnic");
    const goingSlugs = INITIAL_EVENTS.filter(
      (event) => event.category === "going" && event.slug,
    ).map((event) => event.slug);
    for (const goingSlug of goingSlugs) {
      expect(slugs).not.toContain(goingSlug);
    }
  });
});

describe("compareFlashDayEventRefs", () => {
  it("orders upcoming soonest first, then past newest first", () => {
    const now = new Date("2026-10-19T12:00:00Z").getTime();
    const past = makeRef("past", now - DAY_IN_MILLISECONDS);
    const later = makeRef("later", now + 2 * DAY_IN_MILLISECONDS);
    const soon = makeRef("soon", now + DAY_IN_MILLISECONDS);
    const sorted = [past, later, soon].sort((left, right) =>
      compareFlashDayEventRefs(left, right, now),
    );
    expect(sorted.map((ref) => ref.slug)).toEqual(["soon", "later", "past"]);
  });
});

describe("useFlashDayEventOptions", () => {
  beforeEach(() => {
    getFlashDayEventOptionsMock.mockReset();
    getFlashDayEventOptionsMock.mockResolvedValue([]);
  });

  function wrapper({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  }

  it("reads nothing while disabled", async () => {
    renderHook(() => useFlashDayEventOptions("sp-1", false), { wrapper });
    await Promise.resolve();
    expect(getFlashDayEventOptionsMock).not.toHaveBeenCalled();

    renderHook(() => useFlashDayEventOptions("sp-1", true), { wrapper });
    await waitFor(() =>
      expect(getFlashDayEventOptionsMock).toHaveBeenCalledTimes(1),
    );
    expect(getFlashDayEventOptionsMock.mock.calls[0]?.[0]).toBe("sp-1");
  });
});
