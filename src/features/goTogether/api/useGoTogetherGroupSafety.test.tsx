import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoModeProvider } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  demoCard,
  demoGroup,
  demoGroupIdFor,
  demoState,
  resetDemoGoTogetherState,
} from "../goTogether.mock";
import { goTogetherKeys } from "./goTogetherKeys";
import {
  useBlockGoTogetherGroupMember,
  useReportGoTogetherGroupMember,
} from "./useGoTogetherGroupSafety";

/**
 * Block and report one group member (PRD-421), in demo mode, which the test
 * environment forces on. The demo follows the backend's contract: a block
 * moves the blocker out, so the group then answers 404, and a report of
 * your own row is refused with 400.
 */

const EVENT_SLUG = "go-together-safety-test";
const GROUP_ID = demoGroupIdFor(EVENT_SLUG);

function renderWithClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return { invalidateSpy, wrapper };
}

function memberRefOf(mateIndex: number): string {
  const mates = demoGroup(GROUP_ID).members.filter((member) => !member.isYou);
  return mates[mateIndex]!.memberRef;
}

afterEach(() => {
  vi.useRealTimers();
  resetDemoGoTogetherState();
  window.history.pushState({}, "", "/");
});

const HOUR_MS = 60 * 60 * 1000;

function seedGroupedEntry() {
  demoState.entriesBySlug.set(EVENT_SLUG, {
    status: "grouped",
    partnerSlug: null,
    pairStatus: "pending",
    lens: null,
  });
}

/** Moves the demo clock to `offsetMs` from the test gathering's start. */
function setClockFromStart(offsetMs: number) {
  const startMs = Date.parse(demoGroup(GROUP_ID).event.startAt);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(startMs + offsetMs);
}

async function blockFirstMate() {
  const blockedRef = memberRefOf(0);
  const { wrapper } = renderWithClient();
  const { result } = renderHook(() => useBlockGoTogetherGroupMember(GROUP_ID), {
    wrapper,
  });
  await act(async () => {
    await result.current.mutateAsync(blockedRef);
  });
}

describe("useBlockGoTogetherGroupMember", () => {
  it("moves the blocker out of the group and invalidates what that changes", async () => {
    demoState.entriesBySlug.set(EVENT_SLUG, {
      status: "grouped",
      partnerSlug: null,
      pairStatus: "pending",
      lens: null,
    });
    const blockedRef = memberRefOf(0);
    const { invalidateSpy, wrapper } = renderWithClient();
    const { result } = renderHook(
      () => useBlockGoTogetherGroupMember(GROUP_ID),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync(blockedRef);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Before the start the blocker goes back to waiting in the demo.
    expect(demoState.entriesBySlug.get(EVENT_SLUG)?.status).toBe("waiting");
    expect(() => demoGroup(GROUP_ID)).toThrow(ApiError);
    const invalidatedRoots = invalidateSpy.mock.calls.map(
      (call) => (call[0] as { queryKey: unknown[] }).queryKey[0],
    );
    expect(invalidatedRoots).toEqual(
      expect.arrayContaining([
        goTogetherKeys.cardRoot[0],
        goTogetherKeys.groupRoot[0],
        "conversations",
        "conversation-detail",
      ]),
    );
  });

  it("never groups the viewer with the blocked member again", async () => {
    demoState.entriesBySlug.set(EVENT_SLUG, {
      status: "grouped",
      partnerSlug: null,
      pairStatus: "pending",
      lens: null,
    });
    const blockedRef = memberRefOf(0);
    const { wrapper } = renderWithClient();
    const { result } = renderHook(
      () => useBlockGoTogetherGroupMember(GROUP_ID),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync(blockedRef);
    });

    const entry = demoState.entriesBySlug.get(EVENT_SLUG)!;
    demoState.entriesBySlug.set(EVENT_SLUG, { ...entry, status: "grouped" });
    const memberRefs = demoGroup(GROUP_ID).members.map(
      (member) => member.memberRef,
    );
    expect(memberRefs).not.toContain(blockedRef);
  });

  it("stops a ?goTogetherDemo=grouped pin once the block moves the viewer", async () => {
    window.history.pushState({}, "", `/?goTogetherDemo=grouped`);
    expect(demoCard(EVENT_SLUG).state).toBe("grouped");

    await blockFirstMate();

    expect(demoCard(EVENT_SLUG).state).toBe("waiting");
    expect(demoCard(EVENT_SLUG).groupId).toBeNull();
  });

  it("reads closed after a block inside the last hours before the start", async () => {
    seedGroupedEntry();
    setClockFromStart(-2 * HOUR_MS);

    await blockFirstMate();

    expect(demoCard(EVENT_SLUG).state).toBe("closed");
    expect(() => demoGroup(GROUP_ID)).toThrow(ApiError);
  });

  it("reads closed, with the chat left, after a block from the start", async () => {
    seedGroupedEntry();
    setClockFromStart(HOUR_MS);

    await blockFirstMate();

    const card = demoCard(EVENT_SLUG);
    expect(card.state).toBe("closed");
    expect(card.groupId).toBeNull();
    expect(demoState.leftChatGroupIds.has(GROUP_ID)).toBe(true);
    expect(() => demoGroup(GROUP_ID)).toThrow(ApiError);
  });

  it("refuses the viewer's own row", async () => {
    const ownRef = demoGroup(GROUP_ID).members.find(
      (member) => member.isYou,
    )!.memberRef;
    const { wrapper } = renderWithClient();
    const { result } = renderHook(
      () => useBlockGoTogetherGroupMember(GROUP_ID),
      { wrapper },
    );

    await act(async () => {
      await expect(result.current.mutateAsync(ownRef)).rejects.toMatchObject({
        status: 400,
      });
    });
  });
});

describe("useReportGoTogetherGroupMember", () => {
  it("acknowledges a member report locally and changes nothing in the group", async () => {
    const reportedRef = memberRefOf(1);
    const { invalidateSpy, wrapper } = renderWithClient();
    const { result } = renderHook(
      () => useReportGoTogetherGroupMember(GROUP_ID),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync({
        memberRef: reportedRef,
        body: { reasonCode: "harassment" },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({
      subjectType: "member",
      reasonCode: "harassment",
    });
    expect(result.current.data).not.toHaveProperty("subjectId");
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(
      demoGroup(GROUP_ID).members.map((member) => member.memberRef),
    ).toContain(reportedRef);
  });

  it("refuses a ref that is not seated in the group", async () => {
    const { wrapper } = renderWithClient();
    const { result } = renderHook(
      () => useReportGoTogetherGroupMember(GROUP_ID),
      { wrapper },
    );

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          memberRef: "someone-else",
          body: { reasonCode: "harassment" },
        }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
