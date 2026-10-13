import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioOffAirHero } from "./StudioOffAirHero";
import { StudioOffAirShelves } from "./StudioOffAirShelves";

/**
 * The off-air hero and shelves render the page body without `StudioShell`;
 * the shelves take `loading` as a prop, so passing `false` skips the skeleton
 * with no `useSimulatedLoad` timer to stub. Copy comes from the lazy
 * `studioShowcase` and `studio` catalogs, so every query is a `findBy*`.
 */

beforeEach(() => {
  window.localStorage.setItem("qp.lang", "pt");
});

afterEach(() => {
  window.localStorage.clear();
});

describe("StudioOffAirPage in Portuguese", () => {
  it("renders the signoff, next show and card meta lines in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioOffAirHero />
        <StudioOffAirShelves loading={false} />
      </TestProviders>,
    );

    expect(
      await screen.findByText(
        "Sara Marques, a fechar o set de quarta-feira às 01:58",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Ambient e composição trans · 90 minutos · legendas ao vivo",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/^«Tocámos catorze músicas/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Álbum · Mariana Sol · 11 faixas"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Coleção · 22 faixas")).toBeInTheDocument();
    expect(screen.queryByText("Collection · 22 tracks")).toBeNull();
    expect(
      screen.queryByText(
        "Ambient & trans composers · 90 minutes · captioned live",
      ),
    ).toBeNull();
  });
});
