import { render, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { QuizshowHelperPairPage } from "./QuizshowHelperPairPage";

vi.mock("../../../shared/hooks/useScreenWakeLock", () => ({
  useScreenWakeLock: vi.fn(),
}));

function renderPairPage() {
  return render(
    <TestProviders initialEntries={["/play/remote"]}>
      <Routes>
        <Route path="/play/remote" element={<QuizshowHelperPairPage />} />
        <Route path="/play" element={<p>play home</p>} />
      </Routes>
    </TestProviders>,
  );
}

// The test providers run in demo mode, where pairing is unavailable.
describe("QuizshowHelperPairPage in demo", () => {
  it("shows only the demo note and a way back to Pulse Live", async () => {
    renderPairPage();
    await awaitCatalog("quizshow");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Pairing a helper's phone needs the live app/,
      }),
    ).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: "Back to Pulse Live" });
    expect(backLink).toHaveAttribute("href", "/play");
    // No code, no pairing instructions and no new-code action.
    expect(screen.queryByText("Help run this game")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByLabelText(/pairing code/i)).toBeNull();
  });
});
