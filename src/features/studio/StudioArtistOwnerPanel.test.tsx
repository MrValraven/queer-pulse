import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioArtistPage } from "./StudioArtistPage";

function renderMariana() {
  render(
    <TestProviders
      initialEntries={["/studio/artist?id=demo-persona-mariana-sol"]}
    >
      <StudioArtistPage />
    </TestProviders>,
  );
}

describe("owner panel and tools (Studio v3, demo)", () => {
  it("reads a scheduled release with its date and a preview link", async () => {
    renderMariana();
    const panel = await screen.findByRole("region", {
      name: /your releases/i,
    });
    const row = within(panel).getByText("Maré alta").closest("li")!;
    expect(within(row).getByText("Scheduled")).toBeInTheDocument();
    expect(
      within(row).getByText(/^Out .+ at \d{2}:\d{2}$/),
    ).toBeInTheDocument();
    expect(
      within(row).getByRole("button", { name: "Preview link for Maré alta" }),
    ).toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: /^publish/i })).toBeNull();
  });

  it("opens the preview link panel for a draft in a dialog", async () => {
    renderMariana();
    const panel = await screen.findByRole("region", {
      name: /your releases/i,
    });
    fireEvent.click(
      within(panel).getByRole("button", {
        name: "Preview link for Cartas ao mar",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Preview link for Cartas ao mar",
    });
    expect(
      await within(dialog).findByRole("textbox", { name: "Preview link" }),
    ).toBeInTheDocument();
  });

  it("gives the owner the press kit links and the update composer", async () => {
    renderMariana();
    const tools = await screen.findByRole("region", {
      name: "Press kit and updates",
    });
    expect(
      within(tools).getByRole("link", { name: "Press kit" }),
    ).toHaveAttribute("href", "/studio/press?id=demo-persona-mariana-sol");
    expect(
      within(tools).getByRole("link", { name: "Edit press kit" }),
    ).toHaveAttribute(
      "href",
      "/studio/press/edit?persona=demo-persona-mariana-sol",
    );
    expect(
      within(tools).getByRole("button", { name: "Post update" }),
    ).toBeInTheDocument();
  });
});
