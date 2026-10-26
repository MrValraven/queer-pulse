import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { ApiError } from "../../shared/api/client";
import { AccountDataExport } from "./AccountDataExport";

/**
 * The export mutation is `silentError`, so its own toast has to name the
 * cause. Live mode with a cached step-up token, and a start request that the
 * server refuses.
 */
const harness = vi.hoisted(() => ({ requestExport: vi.fn() }));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: false }),
}));

vi.mock("../../app/providers/authContext", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../app/providers/authContext")>()),
  useAuth: () => ({ user: null }),
}));

vi.mock("../settings/api/useAccountMutations", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../settings/api/useAccountMutations")
  >()),
  useReauth: () => ({
    getReauthToken: () => "fresh-token",
    beginReauth: vi.fn(),
  }),
}));

vi.mock("../settings/api/account.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../settings/api/account.api")>()),
  requestExport: harness.requestExport,
}));

function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return (
    <I18nProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

describe("AccountDataExport start errors", () => {
  it("shows the restriction copy for a 403 account-restricted failure", async () => {
    harness.requestExport.mockRejectedValue(
      new ApiError(403, "Account restricted", { code: "ACCOUNT_RESTRICTED" }),
    );
    render(
      <Providers>
        <AccountDataExport />
      </Providers>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Request export/ }),
    );

    expect(
      await screen.findByText(
        "You can't do that while a moderation restriction is in effect. You can appeal it from Safety, under Appeal a decision.",
      ),
    ).toBeInTheDocument();
    expect(harness.requestExport).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("We couldn't start your export. Please try again."),
    ).not.toBeInTheDocument();
  });
});
