import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioAboutPage } from "./StudioAboutPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

function renderAbout() {
  render(
    <TestProviders initialEntries={["/studio/about"]}>
      <StudioAboutPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  showcase.isOn = false;
});

describe("About Studio (live)", () => {
  it("says what Studio is today, with no rates or earnings", async () => {
    renderAbout();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Music by queer artists, for our members.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Listening stays yours" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/0\.05/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /join studio/i }),
    ).not.toBeInTheDocument();
  });

  it("opens Studio home and the Studio terms", async () => {
    renderAbout();
    expect(
      await screen.findByRole("link", { name: "Open Studio" }),
    ).toHaveAttribute("href", "/studio");
    expect(
      screen.getByRole("link", { name: /read the studio terms/i }),
    ).toHaveAttribute("href", "/studio/terms");
  });
});

describe("About Studio (demo)", () => {
  it("adds the co-op vision under the live base", async () => {
    showcase.isOn = true;
    renderAbout();
    expect(
      await screen.findByRole("heading", { name: "The co-op vision" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /pay the artist directly/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /join studio/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Music by queer artists, for our members.",
      }),
    ).toBeInTheDocument();
  });
});
