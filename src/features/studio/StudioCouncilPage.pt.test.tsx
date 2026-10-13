import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioCouncilPage } from "./StudioCouncilPage";

/**
 * The council roster is demo-only, so in Portuguese every seat, role, bio,
 * notebook line and payout label resolves from the `studioShowcase` catalog.
 * The page reads `useSimulatedLoad`, so we stub it to `false` to skip the
 * skeleton cards. Catalogs load lazily, hence `findBy*`.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

beforeEach(() => {
  window.localStorage.setItem("qp.lang", "pt");
});

afterEach(() => {
  window.localStorage.clear();
});

describe("StudioCouncilPage in Portuguese", () => {
  it("renders the council roster from the Portuguese catalog", async () => {
    render(
      <TestProviders initialEntries={["/studio/council"]}>
        <StudioCouncilPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Lugar 1 · preside este trimestre"),
    ).toBeInTheDocument();
    expect(await screen.findByText("DJ e programação")).toBeInTheDocument();
    expect(await screen.findByText("9/06 · 12 faixas")).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Organizou as noites de quarta-feira da Casa do Comum/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Abstém-se de qualquer votação/),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Seat 1 · chair this quarter"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("DJ & programmer")).not.toBeInTheDocument();
  });
});
