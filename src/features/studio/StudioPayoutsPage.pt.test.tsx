import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioPayoutsPage } from "./StudioPayoutsPage";

/**
 * Payout titles, tally lines and play counts are composed from the lazy
 * `studioShowcase` catalog. The page reads `useSimulatedLoad`, so it is
 * stubbed to `false` to skip the skeleton rows.
 */
vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

describe("StudioPayoutsPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("composes payout rows and the breakdown from the pt catalog", async () => {
    render(
      <TestProviders>
        <StudioPayoutsPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Pagamento de junho de 2026"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /36\s400 reproduções · 87 gorjetas · 1 compra de álbum · 12 subscrições diretas/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/^25\s832 reproduções$/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Outras sete faixas/)).toBeInTheDocument();

    expect(screen.queryByText(/June 2026 payout/)).toBeNull();
    expect(screen.queryByText(/832 plays/)).toBeNull();
  });
});
