import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_PERSONA_WALL_NINE_SHOWN } from "../../subprofiles/data/personaWallDemoSeed.data";
import { resetDemoPersonaWall } from "../../subprofiles/personaWallDemoStore";
import { useAdminPersonaWall } from "../api/useAdminPersonaWall";
import { PersonaWallPicksSection } from "./PersonaWallPicksSection";

function Harness({ onAdd }: { onAdd: () => void }) {
  const { data } = useAdminPersonaWall();
  return data ? <PersonaWallPicksSection wall={data} onAdd={onAdd} /> : null;
}

function renderHarness(onAdd: () => void = vi.fn()) {
  render(<Harness onAdd={onAdd} />, { wrapper: TestProviders });
}

const collapseWhitespace = (text: string) => text.replace(/\s+/g, " ").trim();

/** Matches the innermost element whose whole text reads `expected`. The
 *  count's number sits in its own `RollingNumber` span, so the sentence is
 *  spread over several text nodes. */
function hasWholeText(expected: string) {
  return (_content: string, element: Element | null) => {
    if (!element) return false;
    const isMatch = (candidate: Element) =>
      collapseWhitespace(candidate.textContent ?? "") === expected;
    return isMatch(element) && !Array.from(element.children).some(isMatch);
  };
}

function pickList() {
  return screen.getByRole("list", { name: "Picked personas" });
}

function rowNames() {
  return within(pickList())
    .getAllByRole("listitem")
    .map((row) => row.querySelector("[data-pick-name]")?.textContent);
}

function rowNamed(name: string) {
  const row = within(pickList())
    .getAllByRole("listitem")
    .find(
      (candidate) =>
        candidate.querySelector("[data-pick-name]")?.textContent === name,
    );
  if (!row) throw new Error(`No pick row named ${name}`);
  return row;
}

describe("PersonaWallPicksSection (demo)", () => {
  beforeEach(() => resetDemoPersonaWall());

  it("lists the picks in order with the reason a pick is off the wall", async () => {
    renderHarness();
    await waitFor(() =>
      expect(rowNames()).toEqual([
        "NIGHTFORM",
        "BLOCO ROSA",
        "Cadeira Livre",
        "Tiago Costa",
      ]),
    );
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(
      screen.getByText("Not on the wall: the owner moved it back to draft"),
    ).toBeInTheDocument();
    expect(screen.getByText(hasWholeText("4 of 9 picked"))).toBeInTheDocument();
  });

  it("moves a pick down with Move down", async () => {
    renderHarness();
    fireEvent.click(
      await screen.findByRole("button", { name: "Move NIGHTFORM down" }),
    );
    await waitFor(() =>
      expect(rowNames()).toEqual([
        "BLOCO ROSA",
        "NIGHTFORM",
        "Cadeira Livre",
        "Tiago Costa",
      ]),
    );
    expect(
      await screen.findByText("NIGHTFORM is now number 2"),
    ).toBeInTheDocument();
  });

  it("removes a pick with Remove from wall", async () => {
    renderHarness();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Cadeira Livre from the wall",
      }),
    );
    await waitFor(() => expect(rowNames()).not.toContain("Cadeira Livre"));
    expect(
      await screen.findByText("Cadeira Livre is off the wall"),
    ).toBeInTheDocument();
  });

  it("opens the add dialog with Add persona", async () => {
    const onAdd = vi.fn();
    renderHarness(onAdd);
    fireEvent.click(await screen.findByRole("button", { name: "Add persona" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("disables Add persona at nine picks with the reason", async () => {
    resetDemoPersonaWall({
      pickPersonaIds: DEMO_PERSONA_WALL_NINE_SHOWN,
      fillOrder: "endorsed",
    });
    const onAdd = vi.fn();
    renderHarness(onAdd);
    const addButton = await screen.findByRole("button", {
      name: "Add persona",
    });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByText("The wall has 9 picks. Remove one to add another"),
    ).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("puts Desktop only on the seventh shown pick", async () => {
    resetDemoPersonaWall({
      pickPersonaIds: [
        "sp-vera-bloco",
        "sp-tiago-draft",
        "sp-diogo-nightform",
        "sp-bea-cadeira",
        "sp-andre-grain",
        "sp-tomas-casa-corvo",
        "sp-kiko-santacruel",
        "sp-celia-terceiro",
      ],
      fillOrder: "endorsed",
    });
    renderHarness();
    await waitFor(() => expect(rowNames()).toHaveLength(8));
    expect(
      within(rowNamed("Terceiro Piso")).getByText("Desktop only"),
    ).toBeInTheDocument();
    expect(
      within(rowNamed("SANTA CRUEL")).queryByText("Desktop only"),
    ).not.toBeInTheDocument();
    expect(
      within(rowNamed("Tiago Costa")).queryByText("Desktop only"),
    ).not.toBeInTheDocument();
  });

  it("shows an empty line with no picks", async () => {
    resetDemoPersonaWall({ pickPersonaIds: [], fillOrder: "endorsed" });
    renderHarness();
    expect(
      await screen.findByText("No personas picked yet"),
    ).toBeInTheDocument();
  });
});
