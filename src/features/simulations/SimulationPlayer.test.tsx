import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { TestProviders } from "../../test/TestProviders";
import { SimulationPlayer } from "./SimulationPlayer";
import { SIM_GROUPS } from "./simulations.data";

const firstGroup = SIM_GROUPS[0];
if (!firstGroup) throw new Error("expected at least one group");
const firstFlow = firstGroup.flows[0];
if (!firstFlow) throw new Error("expected at least one flow");

function renderAt(path: string) {
  return render(
    // TestProviders, not a bare MemoryRouter: the player reads `useTranslation`,
    // which throws outside an I18nProvider.
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route path="/simulations/:id" element={<SimulationPlayer />} />
      </Routes>
    </TestProviders>,
  );
}

function renderWithGallery(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <Routes>
        <Route path="/simulations/:id" element={<SimulationPlayer />} />
        <Route path="/simulations" element={<div>gallery</div>} />
      </Routes>
    </TestProviders>,
  );
}

describe("SimulationPlayer", () => {
  it("renders a sandbox iframe for a known flow id", async () => {
    renderAt(`/simulations/${firstFlow.id}`);
    const frame = await screen.findByTitle<HTMLIFrameElement>(firstFlow.title);
    expect(frame.getAttribute("src")).toBe(`${firstFlow.to}?sandbox=1`);
    expect(frame.getAttribute("data-sandbox")).toBe("1");
  });

  it("shows a not-found panel for an unknown id", async () => {
    renderAt("/simulations/nope-not-real");
    // Straight-apostrophe regexes miss the curly apostrophe in the EN copy
    // ("couldn’t"), so assert an apostrophe-free substring instead.
    expect(
      await screen.findByText(/It may have been renamed/i),
    ).toBeInTheDocument();
  });

  it("offers a full-screen pop-out to a top-level sandbox tab", async () => {
    renderAt(`/simulations/${firstFlow.id}`);
    const popout = await screen.findByRole<HTMLAnchorElement>("link", {
      name: /open in new tab/i,
    });
    expect(popout.getAttribute("href")).toBe(`${firstFlow.to}?sandbox=1`);
    expect(popout.getAttribute("target")).toBe("_blank");
  });

  it("returns to the gallery when Escape is pressed", async () => {
    renderWithGallery(`/simulations/${firstFlow.id}`);
    await screen.findByTitle(firstFlow.title);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(await screen.findByText("gallery")).toBeInTheDocument();
  });
});
