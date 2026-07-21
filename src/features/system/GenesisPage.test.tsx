import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { GenesisPage } from "./GenesisPage";

const mintGenesisInvite = vi.fn();
const claimGenesisAdmin = vi.fn();
const navigate = vi.fn();
const refresh = vi.fn();
let loggedIn = false;
let demoMode = false;

vi.mock("../../shared/api/genesis.api", () => ({
  mintGenesisInvite: () => mintGenesisInvite(),
  claimGenesisAdmin: () => claimGenesisAdmin(),
}));

vi.mock("../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn, refresh }),
}));

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => navigate };
});

// The shell pulls in i18n and layout providers this test has no interest in.
vi.mock("../../shared/components/layout", () => ({
  SystemStateShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("GenesisPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loggedIn = false;
    demoMode = false;
    mintGenesisInvite.mockResolvedValue({ code: "ABCD2345" });
    claimGenesisAdmin.mockResolvedValue(undefined);
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <GenesisPage />
      </MemoryRouter>,
    );

  it("navigates to the real invite flow after minting", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /generate/i }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/auth/invite/ABCD2345"),
    );
  });

  it("reports closed when the API 404s", async () => {
    mintGenesisInvite.mockRejectedValue(new ApiError(404, "Not Found"));
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /generate/i }));
    expect(await screen.findByText(/closed/i)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("claims admin and refreshes the session when signed in", async () => {
    loggedIn = true;
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /claim/i }));
    await waitFor(() => expect(claimGenesisAdmin).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("reports rejection when the claim is forbidden", async () => {
    loggedIn = true;
    claimGenesisAdmin.mockRejectedValue(new ApiError(403, "Forbidden"));
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /claim/i }));
    expect(await screen.findByText(/cannot claim/i)).toBeInTheDocument();
  });

  it("short-circuits before the network in demo mode and never simulates success", async () => {
    demoMode = true;
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /generate/i }));
    expect(await screen.findByText(/demo mode/i)).toBeInTheDocument();
    expect(mintGenesisInvite).not.toHaveBeenCalled();
    expect(claimGenesisAdmin).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
