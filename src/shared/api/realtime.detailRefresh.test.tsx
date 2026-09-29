import { act, render } from "@testing-library/react";
import type { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MessageResponse } from "../contracts/contracts";
import type { Conversation } from "../../features/messages/data";

/**
 * The detail-refresh path of realtime.ts run against the REAL messageCache
 * (realtime.test.tsx mocks it), so the order of the preview patch and the
 * stale mark is exercised for real. Same module-reset harness as
 * realtime.test.tsx: socket.io-client, auth and demo mode are mocked.
 */

const state = vi.hoisted(() => ({ demoMode: false, loggedIn: true }));

const socket = vi.hoisted(() => ({
  on: vi.fn(),
  disconnect: vi.fn(),
}));

const ioMock = vi.hoisted(() =>
  vi.fn<(url: string, opts: unknown) => typeof socket>(() => socket),
);

vi.mock("socket.io-client", () => ({ io: ioMock }));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({
    demoMode: state.demoMode,
    available: true,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn: state.loggedIn }),
}));

type RealtimeModule = typeof import("./realtime");

const DETAIL_KEY = ["conversation-detail", "c-group", false] as const;
const LIST_KEY = ["conversations", false, "", "personal"] as const;

async function loadRealtime(): Promise<RealtimeModule> {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", "http://api.test");
  return import("./realtime");
}

async function settle(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function mount({
  RealtimeProvider,
  useRealtimeConnection,
}: RealtimeModule): Promise<void> {
  function Consumer() {
    useRealtimeConnection();
    return null;
  }
  render(
    <RealtimeProvider>
      <Consumer />
    </RealtimeProvider>,
  );
  await settle();
}

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "c-group",
    initials: "OL",
    tint: "plum",
    name: "Old title",
    pronouns: "",
    connectedSince: "",
    time: "9:00 AM",
    updatedAt: "2026-09-14T09:00:00Z",
    preview: "hey",
    unread: false,
    messages: [],
    ...overrides,
  };
}

function message(overrides: Partial<MessageResponse> = {}): MessageResponse {
  return {
    id: "m-1",
    conversationId: "c-group",
    body: "Ana changed the photo",
    sender: { handle: "ana", displayName: "Ana", avatarUrl: null },
    createdAt: "2026-09-14T10:00:00Z",
    editedAt: null,
    reactions: [],
    deletedAt: null,
    deliveredAt: null,
    clientMessageId: null,
    forwarded: false,
    pinnedAt: null,
    starred: false,
    canPin: false,
    canEdit: false,
    canDelete: false,
    canReport: false,
    replyTo: null,
    kind: "system",
    attachment: null,
    systemEvent: {
      type: "group_photo_changed",
      actorName: "Ana",
      targetName: null,
      value: null,
    },
    ...overrides,
  };
}

/** Mount the provider, then hand back the frame handlers and the client. */
async function wire() {
  const mod = await loadRealtime();
  const { queryClient } = await import("./queryClient");
  await mount(mod);
  const handlerFor = (event: string) =>
    socket.on.mock.calls.find((call) => call[0] === event)?.[1] as (
      data: unknown,
    ) => void;
  return { handlerFor, queryClient };
}

function detailQuery(queryClient: QueryClient) {
  return queryClient.getQueryCache().find({ queryKey: DETAIL_KEY });
}

/** Calls that refetch the detail now (the window's closing read). */
function detailRefetchCalls(invalidateSpy: {
  mock: { calls: unknown[][] };
}): number {
  return invalidateSpy.mock.calls.filter(([filters]) => {
    const { queryKey, refetchType } = filters as {
      queryKey?: unknown[];
      refetchType?: string;
    };
    return (
      queryKey?.[0] === "conversation-detail" &&
      queryKey?.[1] === "c-group" &&
      refetchType === undefined
    );
  }).length;
}

beforeEach(() => {
  state.demoMode = false;
  state.loggedIn = true;
  ioMock.mockReset();
  ioMock.mockReturnValue(socket);
  socket.on.mockClear();
  socket.disconnect.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("detail refresh with the real message cache", () => {
  it("a system pill leaves an unobserved detail stale after its preview patch", async () => {
    const { handlerFor, queryClient } = await wire();
    queryClient.setQueryData(DETAIL_KEY, conversation());
    handlerFor("message:new")({
      conversationId: "c-group",
      message: message(),
    });
    // The preview patch wrote the detail, and the stale mark survived it.
    expect(queryClient.getQueryData<Conversation>(DETAIL_KEY)?.updatedAt).toBe(
      "2026-09-14T10:00:00Z",
    );
    expect(detailQuery(queryClient)?.state.isInvalidated).toBe(true);
  });

  it("an ordinary message keeps a stale mark left earlier", async () => {
    const { handlerFor, queryClient } = await wire();
    queryClient.setQueryData(DETAIL_KEY, conversation());
    await queryClient.invalidateQueries({
      queryKey: DETAIL_KEY,
      refetchType: "none",
    });
    handlerFor("message:new")({
      conversationId: "c-group",
      message: message({ id: "m-user", kind: "user", systemEvent: null }),
    });
    expect(queryClient.getQueryData<Conversation>(DETAIL_KEY)?.updatedAt).toBe(
      "2026-09-14T10:00:00Z",
    );
    expect(detailQuery(queryClient)?.state.isInvalidated).toBe(true);
  });

  it("refreshes once for a pill that arrives on both message frames", async () => {
    const { handlerFor, queryClient } = await wire();
    queryClient.setQueryData(DETAIL_KEY, conversation());
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    vi.useFakeTimers();
    const frame = { conversationId: "c-group", message: message() };
    handlerFor("message:new")(frame);
    handlerFor("conversation:message")(frame);
    vi.advanceTimersByTime(1000);
    expect(detailRefetchCalls(invalidateSpy)).toBe(1);
  });

  it("folds a burst of pills and the group refresh into one read", async () => {
    const { handlerFor, queryClient } = await wire();
    queryClient.setQueryData(DETAIL_KEY, conversation());
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    vi.useFakeTimers();
    for (const id of ["m-a", "m-b", "m-c"]) {
      handlerFor("message:new")({
        conversationId: "c-group",
        message: message({ id }),
      });
    }
    handlerFor("conversation:new")({ conversationId: "c-group" });
    expect(detailRefetchCalls(invalidateSpy)).toBe(0);
    vi.advanceTimersByTime(1000);
    expect(detailRefetchCalls(invalidateSpy)).toBe(1);
  });

  it("patches a group_renamed title into the list row and the detail", async () => {
    const { handlerFor, queryClient } = await wire();
    queryClient.setQueryData(LIST_KEY, [conversation()]);
    queryClient.setQueryData(DETAIL_KEY, conversation());
    handlerFor("message:new")({
      conversationId: "c-group",
      message: message({
        id: "m-rename",
        systemEvent: {
          type: "group_renamed",
          actorName: "Ana",
          targetName: null,
          value: "Book club",
        },
      }),
    });
    const row = queryClient.getQueryData<Conversation[]>(LIST_KEY)?.[0];
    expect(row?.name).toBe("Book club");
    expect(row?.initials).toBe("BC");
    expect(queryClient.getQueryData<Conversation>(DETAIL_KEY)?.name).toBe(
      "Book club",
    );
  });
});
