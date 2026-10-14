import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioWithdrawnPage } from "./StudioWithdrawnPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

beforeEach(() => {
  showcase.isOn = false;
});

describe("StudioWithdrawnPage", () => {
  it("renders the withdrawn view with no release named in live", async () => {
    render(
      <TestProviders initialEntries={["/studio/withdrawn"]}>
        <StudioWithdrawnPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "This release was withdrawn",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Mariana Sol · 11 tracks"),
    ).not.toBeInTheDocument();
  });

  it("keeps the showcase page and its still-available cards in the demo", async () => {
    showcase.isOn = true;
    render(
      <TestProviders initialEntries={["/studio/withdrawn"]}>
        <StudioWithdrawnPage />
      </TestProviders>,
    );
    expect(
      await screen.findByText("Mariana Sol · 11 tracks"),
    ).toBeInTheDocument();
  });
});
