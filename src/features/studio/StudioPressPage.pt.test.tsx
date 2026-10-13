import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioPressPage } from "./StudioPressPage";

/**
 * The press kit's showcase copy (facts, release line, pull quotes,
 * boilerplate, contact line) lives in the lazy `studioShowcase` catalog. With
 * the stored language set to pt, every query waits with `findBy*`.
 */
describe("StudioPressPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the press kit copy from the pt catalog", async () => {
    render(
      <TestProviders>
        <StudioPressPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText(
        "Álbum · 11 faixas · lançado a 14 mar 2026 · CC-BY-NC",
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText("ela / dela")).toBeInTheDocument();
    expect(
      await screen.findByText(
        /A Sol canta como quem negoceia com Deus e ganha/,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Fado · música devocional · canção erudita"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/A Mariana trata da própria imprensa/),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Album · 11 tracks · released 14 Mar 2026 · CC-BY-NC"),
    ).toBeNull();
    expect(screen.queryByText(/negotiating with God/)).toBeNull();
  });
});
