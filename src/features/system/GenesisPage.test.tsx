import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ApiError } from "../../shared/api/client";
import type {
  GenesisInviteDTO,
  GenesisStatusDTO,
} from "../../shared/api/genesis.api";
import { GenesisPage } from "./GenesisPage";

const mintGenesisInvite = vi.fn<() => Promise<GenesisInviteDTO>>();
const claimGenesisAdmin = vi.fn<() => Promise<void>>();
const getGenesisStatus = vi.fn<() => Promise<GenesisStatusDTO>>();
const navigate = vi.fn();
const refresh = vi.fn();
let loggedIn = false;
let demoMode = false;

vi.mock("../../shared/api/genesis.api", () => ({
  mintGenesisInvite: () => mintGenesisInvite(),
  claimGenesisAdmin: () => claimGenesisAdmin(),
  getGenesisStatus: () => getGenesisStatus(),
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn, refresh }),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigate };
});

// The shell pulls in i18n and layout providers this test has no interest in.
vi.mock("../../shared/components/layout", () => ({
  SystemStateShell: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Collapse mounts and unmounts at once here, so a view that folds away is gone
// on the next assertion with no motion exit to wait out.
vi.mock("../../shared/components/ui", async () => {
  const actual = await vi.importActual<
    typeof import("../../shared/components/ui")
  >("../../shared/components/ui");
  return {
    ...actual,
    Collapse: ({
      isOpen,
      children,
    }: {
      isOpen: boolean;
      children: ReactNode;
    }) => (isOpen ? <div>{children}</div> : null),
  };
});

describe("GenesisPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loggedIn = false;
    demoMode = false;
    getGenesisStatus.mockResolvedValue({ open: true });
    mintGenesisInvite.mockResolvedValue({ code: "ABCD2345" });
    claimGenesisAdmin.mockResolvedValue(undefined);
  });

  // The page's copy comes from the real `system` catalog, so the assertions
  // below read the shipped words from the catalog. That
  // namespace loads lazily, which is why every first query is a `findBy*`.
  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <MemoryRouter>
            <GenesisPage />
          </MemoryRouter>
        </I18nProvider>
      </QueryClientProvider>,
    );
  };

  const clickButton = async (name: RegExp) =>
    userEvent.click(await screen.findByRole("button", { name }));

  it("navigates to the real invite flow after minting", async () => {
    renderPage();
    await clickButton(/generate/i);
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/auth/invite/ABCD2345"),
    );
  });

  it("shows the closed view with no button when the status says closed", async () => {
    getGenesisStatus.mockResolvedValue({ open: false });
    renderPage();
    expect(await screen.findByText(/already been used/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("switches to the closed view when the mint 404s", async () => {
    mintGenesisInvite.mockRejectedValue(new ApiError(404, "Not Found"));
    renderPage();
    await clickButton(/generate/i);
    expect(await screen.findByText(/already been used/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("claims admin, refreshes the session and hides the claim button", async () => {
    loggedIn = true;
    renderPage();
    await clickButton(/claim/i);
    await waitFor(() => expect(claimGenesisAdmin).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/now an admin/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /claim/i }),
    ).not.toBeInTheDocument();
  });

  it("swaps to the closed view when the claim comes back genesis_closed", async () => {
    loggedIn = true;
    claimGenesisAdmin.mockRejectedValue(
      new ApiError(403, "Genesis is closed", {
        statusCode: 403,
        code: "genesis_closed",
        message: "Genesis is closed",
      }),
    );
    renderPage();
    await clickButton(/claim/i);
    expect(await screen.findByText(/already been used/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /claim/i }),
    ).not.toBeInTheDocument();
  });

  it("reports rejection when the claim is forbidden for this account", async () => {
    loggedIn = true;
    claimGenesisAdmin.mockRejectedValue(
      new ApiError(403, "Forbidden", {
        statusCode: 403,
        code: "genesis_not_founder_account",
        message: "Forbidden",
      }),
    );
    renderPage();
    await clickButton(/claim/i);
    expect(await screen.findByText(/cannot claim/i)).toBeInTheDocument();
  });

  it("names the rate limit when the claim is throttled", async () => {
    loggedIn = true;
    claimGenesisAdmin.mockRejectedValue(new ApiError(429, "Too Many Requests"));
    renderPage();
    await clickButton(/claim/i);
    expect(await screen.findByText(/too many tries/i)).toBeInTheDocument();
  });

  it("names a failed status check and shows no button", async () => {
    getGenesisStatus.mockRejectedValue(
      new ApiError(500, "Internal Server Error"),
    );
    renderPage();
    expect(
      await screen.findByText(/check whether genesis is still open/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("short-circuits before the network in demo mode and never simulates success", async () => {
    demoMode = true;
    renderPage();
    await clickButton(/generate/i);
    expect(await screen.findByText(/demo mode/i)).toBeInTheDocument();
    expect(getGenesisStatus).not.toHaveBeenCalled();
    expect(mintGenesisInvite).not.toHaveBeenCalled();
    expect(claimGenesisAdmin).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
