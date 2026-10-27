import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioPlaybackSettings } from "./StudioSettingsPlayback";
import { StudioSettingsClaimsLink } from "./StudioSettingsClaimsLink";

const savePreferences = vi.fn();
let askBeforeWarnings: boolean | undefined = undefined;

vi.mock("./api/useStudioPlaybackPreferences", () => ({
  useStudioPlaybackRow: () => ({
    autoplayNext: true,
    hideExplicit: false,
    crossfadeSeconds: 0,
    askBeforeWarnings,
  }),
  useStudioPlaybackPreferences: () => ({
    preferences: {
      autoplayNext: true,
      hideExplicit: false,
      crossfadeSeconds: 0,
      askBeforeWarnings,
    },
    isLoading: false,
    isError: false,
    loadState: {
      isLoading: false,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      retry: () => {},
    },
    refetch: () => {},
    savePreferences,
  }),
}));

beforeEach(() => {
  savePreferences.mockReset();
  askBeforeWarnings = undefined;
});

describe("Ask before warned tracks", () => {
  it("reads a missing value as on and saves the switch off", () => {
    render(
      <TestProviders>
        <StudioPlaybackSettings />
      </TestProviders>,
    );
    const toggle = screen.getByRole("switch", {
      name: /ask before warned tracks/i,
    });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(toggle);
    expect(savePreferences).toHaveBeenCalledWith({ askBeforeWarnings: false });
  });

  it("saves the switch back on", () => {
    askBeforeWarnings = false;
    render(
      <TestProviders>
        <StudioPlaybackSettings />
      </TestProviders>,
    );
    fireEvent.click(
      screen.getByRole("switch", { name: /ask before warned tracks/i }),
    );
    expect(savePreferences).toHaveBeenCalledWith({ askBeforeWarnings: true });
  });
});

describe("StudioSettingsClaimsLink", () => {
  it("links to the member's claims", () => {
    render(
      <TestProviders>
        <StudioSettingsClaimsLink />
      </TestProviders>,
    );
    expect(
      screen
        .getAllByRole("link")
        .some((link) => link.getAttribute("href") === "/studio/claims"),
    ).toBe(true);
  });
});
