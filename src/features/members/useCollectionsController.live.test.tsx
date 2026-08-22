import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";

/**
 * Collections dual-mode wiring (audit P2-11). The controller must call the real
 * `/me/collections` mutations in LIVE mode (create / add item / remove item),
 * while DEMO mode keeps its seeded local-state grid and touches no API. We mock
 * the collections react-query hook so the mutations are inspectable spies, and
 * flip `useDemoMode` per test.
 *
 * Only the four providers the controller actually consumes are supplied/mocked
 * — `useSaved`, `useToast`, `useDemoMode`, and the collections hook — so the
 * test never boots the app's live saved-store fetch. `useTranslation`/`useFormat`
 * stay real under `I18nProvider` (the controller formats copy with them).
 */

const demoState = vi.hoisted(() => ({ demoMode: false }));

// `addItem`/`rename`/`remove` are awaited by the controller (the picker only
// shows its success panel once the write lands), so they need a `mutateAsync`
// spy as well as `mutate`.
const mutations = vi.hoisted(() => ({
  create: { mutate: vi.fn() },
  rename: {
    mutate: vi.fn(),
    mutateAsync: vi.fn(async (_variables: unknown) => undefined),
  },
  remove: {
    mutate: vi.fn(),
    mutateAsync: vi.fn(async (_variables: unknown) => undefined),
  },
  addItem: {
    mutate: vi.fn(),
    mutateAsync: vi.fn(async (_variables: unknown) => undefined),
  },
  removeItem: { mutate: vi.fn() },
}));

const showToast = vi.hoisted(() => vi.fn());

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => demoState,
}));

vi.mock("./api/useCollections", () => ({
  collectionsKeys: {
    all: () => ["collections"],
    list: () => ["collections", "list"],
    detail: () => ["collections", "detail"],
  },
  useMyCollections: () => ({ data: [], isLoading: false }),
  useCollectionDetail: () => ({ data: undefined }),
  useFiledRefs: () => ({ data: [] }),
  useCollectionMutations: () => mutations,
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("../../app/providers/useSaved", () => ({
  useSaved: () => ({ items: [] }),
}));

// Imported AFTER the mocks are registered so it binds to them.
import { useCollectionsController } from "./useCollectionsController";

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider>{children}</I18nProvider>
);

afterEach(() => {
  Object.values(mutations).forEach((mutation) => {
    mutation.mutate.mockReset();
    if ("mutateAsync" in mutation) mutation.mutateAsync.mockReset();
  });
  showToast.mockReset();
});

describe("useCollectionsController — live mode calls the API", () => {
  beforeEach(() => {
    demoState.demoMode = false;
  });

  it("creates a collection via the API (name only — privacy is presentational)", () => {
    const { result } = renderHook(() => useCollectionsController(), { wrapper });

    act(() => result.current.createCollection("Pride reads", "private"));

    expect(mutations.create.mutate).toHaveBeenCalledTimes(1);
    expect(mutations.create.mutate.mock.calls[0]?.[0]).toEqual({
      name: "Pride reads",
    });
  });

  it("adds a saved item to a collection via the API using its real ref", async () => {
    const { result } = renderHook(() => useCollectionsController(), { wrapper });

    await act(() =>
      result.current.addSaveToCollection("col-1", {
        id: "post:abc-123",
        kind: "ART",
        kindVariant: "article",
        title: "A good read",
        saved: "2d ago",
      }),
    );

    expect(mutations.addItem.mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutations.addItem.mutateAsync.mock.calls[0]?.[0]).toEqual({
      id: "col-1",
      ref: "post:abc-123",
    });
  });

  it("removes an item from a collection via the API", () => {
    const { result } = renderHook(() => useCollectionsController(), { wrapper });

    act(() => result.current.removeSaveFromCollection("col-1", "post:abc-123"));

    expect(mutations.removeItem.mutate).toHaveBeenCalledTimes(1);
    expect(mutations.removeItem.mutate.mock.calls[0]?.[0]).toEqual({
      id: "col-1",
      ref: "post:abc-123",
    });
  });
});

describe("useCollectionsController — demo mode keeps the mock", () => {
  beforeEach(() => {
    demoState.demoMode = true;
  });

  it("creates a collection in local state WITHOUT calling the API", async () => {
    const { result } = renderHook(() => useCollectionsController(), { wrapper });

    act(() => result.current.createCollection("Weekend plans", "private"));

    // No network mutation fires in demo...
    expect(mutations.create.mutate).not.toHaveBeenCalled();
    // ...and the new collection appears in the local grid.
    await waitFor(() =>
      expect(
        result.current.collections.some((c) => c.plainName === "Weekend plans"),
      ).toBe(true),
    );
  });
});
