import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReconcileSession } from "./useLiveSessionBootstrap";

// T11: the fixed-key member stores go only when the server itself refused the
// session. A struggling backend answering the refresh with a 503 keeps them.

interface ReconcileMocks {
  wipeFixedKeyMemberStores: ReturnType<typeof vi.fn>;
  fetchMe: ReturnType<typeof vi.fn>;
}

const mocks = vi.hoisted<ReconcileMocks>(() => ({
  wipeFixedKeyMemberStores: vi.fn(),
  fetchMe: vi.fn(),
}));

vi.mock("./wipeMemberLocalData", () => ({
  adoptConfirmedMember: vi.fn(),
  wipeFixedKeyMemberStores: mocks.wipeFixedKeyMemberStores,
}));
vi.mock("../../features/auth/api/auth.api", () => ({
  bootstrapCsrf: vi.fn(() => Promise.resolve()),
  fetchMe: mocks.fetchMe,
}));

/** Answers every `POST /auth/refresh` with `status`. */
function stubRefreshStatus(status: number): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        statusText: "",
        json: () => Promise.resolve({}),
        text: () => Promise.resolve("{}"),
      } as unknown as Response),
    ),
  );
}

function renderReconcile() {
  return renderHook(() =>
    useReconcileSession({
      hasEverLoggedIn: () => true,
      markEverLoggedIn: vi.fn(),
      setUser: vi.fn(),
      setLoggedIn: vi.fn(),
      setAuthError: vi.fn(),
    }),
  );
}

describe("useReconcileSession wipe rule", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mocks.wipeFixedKeyMemberStores.mockReset();
    mocks.fetchMe.mockReset();
  });

  it("keeps the stores when the refresh is answered with a 503", async () => {
    stubRefreshStatus(503);
    const { result } = renderReconcile();

    await act(() => result.current());

    expect(mocks.wipeFixedKeyMemberStores).not.toHaveBeenCalled();
  });

  it("wipes the stores when the server refuses the refresh with a 401", async () => {
    stubRefreshStatus(401);
    const { result } = renderReconcile();

    await act(() => result.current());

    expect(mocks.wipeFixedKeyMemberStores).toHaveBeenCalledTimes(1);
  });
});
