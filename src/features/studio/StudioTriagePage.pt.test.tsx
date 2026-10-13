import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioTriagePage } from "./StudioTriagePage";

/**
 * The triage page renders its demo submissions in Portuguese when the reader
 * picks PT: badges, day counters, meta lines, artist notes and the claim
 * status all resolve through the `studioShowcase` catalog. The list reads
 * `useSimulatedLoad`, so we stub it to `false` to skip the skeleton. Catalogs
 * load lazily, hence `findBy*`.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

describe("StudioTriagePage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the submission rows and claim status in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioTriagePage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Partitura com cifras anexada"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Dia 9")).toBeInTheDocument();
    expect(
      await screen.findByText("Licenças de 18 artistas de origem confirmadas"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /conheces-me como quem traduziu o disco da Mariana/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Reclamada por Sara M."),
    ).toBeInTheDocument();

    expect(screen.queryByText("Lead sheet attached")).toBeNull();
    expect(screen.queryByText("Claimed by Sara M.")).toBeNull();
  });
});
