import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ApiError } from "../../shared/api/client";
import type { GenesisInviteDTO } from "../../shared/api/genesis.api";
import { GenesisPage } from "./GenesisPage";

const mintGenesisInvite = vi.fn<() => Promise<GenesisInviteDTO>>();
const claimGenesisAdmin = vi.fn<() => Promise<void>>();
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
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
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

  // The page's copy comes from the real `system` catalog, so the assertions
  // below read the shipped words rather than a duplicated literal. That
  // namespace loads lazily, which is why every first query is a `findBy*`.
  const renderPage = () =>
    render(
      <I18nProvider>
        <MemoryRouter>
          <GenesisPage />
        </MemoryRouter>
      </I18nProvider>,
    );

  const clickButton = async (name: RegExp) =>
    userEvent.click(await screen.findByRole("button", { name }));

  it("navigates to the real invite flow after minting", async () => {
    renderPage();
    await clickButton(/generate/i);
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith("/auth/invite/ABCD2345"),
    );
  });

  it("reports closed when the API 404s", async () => {
    mintGenesisInvite.mockRejectedValue(new ApiError(404, "Not Found"));
    renderPage();
    await clickButton(/generate/i);
    expect(await screen.findByText(/closed/i)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("claims admin and refreshes the session when signed in", async () => {
    loggedIn = true;
    renderPage();
    await clickButton(/claim/i);
    await waitFor(() => expect(claimGenesisAdmin).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("reports rejection when the claim is forbidden", async () => {
    loggedIn = true;
    claimGenesisAdmin.mockRejectedValue(new ApiError(403, "Forbidden"));
    renderPage();
    await clickButton(/claim/i);
    expect(await screen.findByText(/cannot claim/i)).toBeInTheDocument();
  });

  it("short-circuits before the network in demo mode and never simulates success", async () => {
    demoMode = true;
    renderPage();
    await clickButton(/generate/i);
    expect(await screen.findByText(/demo mode/i)).toBeInTheDocument();
    expect(mintGenesisInvite).not.toHaveBeenCalled();
    expect(claimGenesisAdmin).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
