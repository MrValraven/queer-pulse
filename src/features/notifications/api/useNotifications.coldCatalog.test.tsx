import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  I18nContext,
  type I18nContextValue,
} from "../../../app/providers/i18nContext";
import type { TFunction } from "../../../shared/i18n/types";
import {
  getNotificationsPage,
  type NotificationDTO,
} from "./notifications.api";
import { useNotifications } from "./useNotifications";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("./notifications.api", () => ({
  getNotificationsPage: vi.fn(),
}));

/** What the provider's `t` returns for a lazy namespace that has not arrived
 *  while the active language is not English. */
const tWhileNamespacePending: TFunction = () => "";
/** The provider's `t` once the namespace arrived: a new function identity. */
const tAfterNamespaceArrived: TFunction = (key) => `translated:${key}`;

const eventReminderDto: NotificationDTO = {
  id: "3f1c8a52-9b0e-4d6a-8f21-7c5e2b9a1d04",
  userId: "9a2b1c3d-4e5f-6071-8293-a4b5c6d7e8f9",
  type: "event_reminder",
  payload: { eventId: "e1" },
  read: false,
  createdAt: "2026-07-16T10:30:00.000Z",
};

describe("useNotifications on a cold catalog", () => {
  beforeEach(() => {
    vi.mocked(getNotificationsPage).mockReset();
    vi.mocked(getNotificationsPage).mockResolvedValue({
      items: [eventReminderDto],
      total: 1,
      page: 1,
      pageSize: 20,
    });
  });

  it("translates the cached rows when the namespace arrives, without a refetch", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    let hasNamespaceArrived = false;
    function wrapper({ children }: { children: ReactNode }) {
      const i18nValue: I18nContextValue = {
        language: "pt",
        setLanguage: () => {},
        t: hasNamespaceArrived
          ? tAfterNamespaceArrived
          : tWhileNamespacePending,
        translateIn: () => undefined,
      };
      return (
        <QueryClientProvider client={queryClient}>
          <I18nContext.Provider value={i18nValue}>
            {children}
          </I18nContext.Provider>
        </QueryClientProvider>
      );
    }

    const { result, rerender } = renderHook(() => useNotifications(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.items[0]?.text).toBe("");
    expect(result.current.items[0]?.meta).toBe("");

    hasNamespaceArrived = true;
    rerender();

    expect(result.current.items[0]?.text).toEqual(
      expect.stringContaining("translated:notifications:type."),
    );
    expect(result.current.items[0]?.meta).toEqual(
      expect.stringContaining("translated:notifications:type."),
    );
    expect(getNotificationsPage).toHaveBeenCalledTimes(1);
  });
});
