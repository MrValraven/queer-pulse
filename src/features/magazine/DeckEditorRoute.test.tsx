import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { routes } from "../../app/routeMap";
import { DeckEditorRoute } from "./DeckEditorRoute";

/**
 * The deck editor's route guard, in its three branches. `useDemoMode` is
 * mocked directly (precedent: `authGate.test.tsx`) so live mode is
 * reachable in a test, and `DeckEditorPage` is mocked to a stub so the
 * guard's own branching is what each case checks.
 */
const mocks = vi.hoisted(() => ({ isDemoMode: false }));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: mocks.isDemoMode }),
}));

vi.mock("./DeckEditorPage", () => ({
  DeckEditorPage: () => <div>deck editor page</div>,
}));

function renderRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={routes.deckEditor} element={<DeckEditorRoute />} />
        <Route
          path={routes.magazineEditor}
          element={<div>magazine editor</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("DeckEditorRoute", () => {
  it("redirects to the magazine editor in live mode with no id", () => {
    mocks.isDemoMode = false;
    renderRoute(routes.deckEditor);

    expect(screen.getByText("magazine editor")).toBeInTheDocument();
    expect(screen.queryByText("deck editor page")).not.toBeInTheDocument();
  });

  it("renders the deck editor in live mode with an id", () => {
    mocks.isDemoMode = false;
    renderRoute(`${routes.deckEditor}?id=deck-1`);

    expect(screen.getByText("deck editor page")).toBeInTheDocument();
  });

  it("renders the deck editor in demo mode with no id", () => {
    mocks.isDemoMode = true;
    renderRoute(routes.deckEditor);

    expect(screen.getByText("deck editor page")).toBeInTheDocument();
  });
});
