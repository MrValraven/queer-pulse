import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CLOSE_READ_NOTIFICATIONS_DEBOUNCE_MS,
  readConversationIdsIn,
  selectNotificationsToClose,
  useCloseReadNotifications,
} from "./useCloseReadNotifications";

function makeNotification(tag: string, data: unknown) {
  return { tag, data, close: vi.fn() } as unknown as Notification & {
    close: ReturnType<typeof vi.fn>;
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("readConversationIdsIn", () => {
  it("returns null for anything that is not a list", () => {
    expect(readConversationIdsIn(undefined)).toBeNull();
    expect(readConversationIdsIn(3)).toBeNull();
  });

  it("keeps only rows with nothing unread", () => {
    const readIds = readConversationIdsIn([
      { id: "read", unread: false },
      { id: "read-with-zero", unread: false, unreadCount: 0 },
      { id: "unread", unread: true },
      { id: "inconsistent", unread: false, unreadCount: 2 },
      { unread: false },
      null,
    ]);
    expect([...(readIds ?? [])].sort()).toEqual(["read", "read-with-zero"]);
  });
});

describe("selectNotificationsToClose", () => {
  it("matches only message notifications whose tag and data agree", () => {
    const matching = makeNotification("c1", { conversationId: "c1" });
    const unreadConversation = makeNotification("c2", { conversationId: "c2" });
    const otherType = makeNotification("c1", { url: "/notifications" });
    const mismatchedTag = makeNotification("notification:9", {
      conversationId: "c1",
    });
    expect(
      selectNotificationsToClose(
        [matching, unreadConversation, otherType, mismatchedTag],
        new Set(["c1"]),
      ),
    ).toEqual([matching]);
  });
});

describe("useCloseReadNotifications", () => {
  it("closes a read conversation's notification after the debounce, without fetching", async () => {
    vi.useFakeTimers();
    const readNotification = makeNotification("c1", { conversationId: "c1" });
    const unreadNotification = makeNotification("c2", {
      conversationId: "c2",
    });
    const getNotifications = vi
      .fn()
      .mockResolvedValue([readNotification, unreadNotification]);
    vi.stubGlobal("navigator", {
      serviceWorker: {
        getRegistration: () => Promise.resolve({ getNotifications }),
      },
    });
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    renderHook(() => useCloseReadNotifications(), { wrapper });

    queryClient.setQueryData(
      ["conversations", false, ""],
      [
        { id: "c1", unread: false, unreadCount: 0 },
        { id: "c2", unread: true, unreadCount: 1 },
      ],
    );
    await vi.advanceTimersByTimeAsync(CLOSE_READ_NOTIFICATIONS_DEBOUNCE_MS - 1);
    expect(getNotifications).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    expect(getNotifications).toHaveBeenCalledTimes(1);
    expect(readNotification.close).toHaveBeenCalledTimes(1);
    expect(unreadNotification.close).not.toHaveBeenCalled();
  });

  it("ignores writes to other query keys", async () => {
    vi.useFakeTimers();
    const getRegistration = vi.fn();
    vi.stubGlobal("navigator", { serviceWorker: { getRegistration } });
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    renderHook(() => useCloseReadNotifications(), { wrapper });

    queryClient.setQueryData(["notifications"], [{ id: "c1", unread: false }]);
    await vi.advanceTimersByTimeAsync(CLOSE_READ_NOTIFICATIONS_DEBOUNCE_MS);

    expect(getRegistration).not.toHaveBeenCalled();
  });
});
