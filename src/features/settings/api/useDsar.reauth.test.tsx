import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ReauthRequiredError } from "./reauthRequiredError";
import { useSubmitDsar } from "./useDsar";

/**
 * The live branch with no cached step-up token. Demo resolves the request
 * without ever asking for a token, so this file pins live mode and a token
 * cache that is empty.
 */
const harness = vi.hoisted(() => ({
  beginReauth: vi.fn(),
  submitDsar: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("./useAccountMutations", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./useAccountMutations")>()),
  useReauth: () => ({
    getReauthToken: () => null,
    beginReauth: harness.beginReauth,
  }),
}));

vi.mock("./account.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./account.api")>()),
  submitDsar: harness.submitDsar,
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useSubmitDsar with no step-up token", () => {
  it("opens the code dialog and settles with ReauthRequiredError", async () => {
    const { result } = renderHook(() => useSubmitDsar(), { wrapper });

    await expect(
      result.current({ article: 15, scopes: ["profile"], details: "A copy" }),
    ).rejects.toBeInstanceOf(ReauthRequiredError);

    expect(harness.beginReauth).toHaveBeenCalledTimes(1);
    expect(harness.submitDsar).not.toHaveBeenCalled();
  });
});
