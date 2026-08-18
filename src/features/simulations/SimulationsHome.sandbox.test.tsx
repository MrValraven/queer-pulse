import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SimulationsHome } from "./SimulationsHome";

// Forces isSandbox() true for every importer of this module in this file,
// so SimulationsHome takes its "inside a running simulation" branch instead
// of rendering the gallery, proving the recursion guard actually short
// circuits rather than just existing in source.
vi.mock("../../shared/sandbox/sandbox", () => ({ isSandbox: () => true }));

describe("SimulationsHome inside a sandbox instance", () => {
  it("shows a notice instead of the gallery", async () => {
    render(
      <MemoryRouter>
        <SimulationsHome />
      </MemoryRouter>,
    );
    expect(
      await screen.findByText(/not available inside a running simulation/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
