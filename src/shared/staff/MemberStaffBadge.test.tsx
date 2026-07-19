import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { MemberStaffBadge } from "./MemberStaffBadge";

const mockAuth = vi.hoisted(() => ({ loggedIn: true }));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => mockAuth,
}));
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

function renderBadge(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>{node}</I18nProvider>
    </QueryClientProvider>,
  );
}

describe("MemberStaffBadge", () => {
  it("renders the badge for a staff slug", async () => {
    mockAuth.loggedIn = true;
    renderBadge(<MemberStaffBadge slug="tiago" size="lg" />);
    await waitFor(() =>
      expect(screen.getByText("QueerPulse Staff")).toBeInTheDocument(),
    );
  });

  it("renders nothing for a member who is not staff", async () => {
    mockAuth.loggedIn = true;
    const { container } = renderBadge(<MemberStaffBadge slug="sofia" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("renders nothing when logged out", async () => {
    mockAuth.loggedIn = false;
    const { container } = renderBadge(<MemberStaffBadge slug="tiago" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
