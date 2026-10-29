import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioMePage } from "./StudioMePage";

vi.mock("../../shared/components/layout/useAccountIdentity", () => ({
  useAccountIdentity: () => ({
    name: "Robin Vale",
    firstName: "Robin",
    photo: undefined,
    initials: "RV",
    pronouns: undefined,
  }),
}));
vi.mock("./StudioMePlaylists", () => ({
  StudioMePlaylists: () => (
    <div data-testid="me-section" data-section="playlists" />
  ),
}));
vi.mock("./StudioMeTopArtists", () => ({
  StudioMeTopArtists: () => (
    <div data-testid="me-section" data-section="top-artists" />
  ),
}));
vi.mock("./StudioMeFollowing", () => ({
  StudioMeFollowing: () => (
    <div data-testid="me-section" data-section="following" />
  ),
}));
vi.mock("./StudioMeRecent", () => ({
  StudioMeRecent: () => <div data-testid="me-section" data-section="recent" />,
}));

function renderPage() {
  render(
    <TestProviders initialEntries={["/studio/me"]}>
      <StudioMePage />
    </TestProviders>,
  );
}

describe("StudioMePage", () => {
  it("shows the title, the dek and the member's name", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "Your profile" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Only you can see this page/)).toBeInTheDocument();
    expect(screen.getByText("Robin Vale")).toBeInTheDocument();
  });

  it("renders playlists, top artists, following and recent in that order", () => {
    renderPage();
    const sectionTexts = screen
      .getAllByTestId("me-section")
      .map((sectionElement) => sectionElement.dataset.section);
    expect(sectionTexts).toEqual([
      "playlists",
      "top-artists",
      "following",
      "recent",
    ]);
  });
});
