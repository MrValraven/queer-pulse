import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn: true }),
}));
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

function renderInApp(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // I18nProvider is REQUIRED: StaffBadge calls useTranslation(), which throws
  // without it. Precedent: src/shared/components/ui/ComingSoon.test.tsx.
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <MemoryRouter>{node}</MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

describe("staff badge on member surfaces", () => {
  it("marks a moderator in a directory-style row", async () => {
    renderInApp(
      <div>
        <span>Mariana</span>
        <MemberStaffBadge slug="mariana" />
      </div>,
    );
    await waitFor(() => expect(screen.getByText("Mod")).toBeInTheDocument());
  });

  it("marks a grant holder who is on the ordinary member tier", async () => {
    renderInApp(
      <div>
        <span>Inês</span>
        <MemberStaffBadge slug="ines" />
      </div>,
    );
    await waitFor(() =>
      expect(screen.getByText("Housing Moderator")).toBeInTheDocument(),
    );
  });

  it("leaves a plain member unmarked", async () => {
    renderInApp(
      <div>
        <span>Sofia</span>
        <MemberStaffBadge slug="sofia" />
      </div>,
    );
    await waitFor(() =>
      expect(screen.queryByText("Mod")).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("Staff")).not.toBeInTheDocument();
    expect(screen.queryByText("Housing Moderator")).not.toBeInTheDocument();
  });
});
