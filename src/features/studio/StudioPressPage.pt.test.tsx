import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioPressPage } from "./StudioPressPage";

/**
 * The press kit's showcase copy (facts, boilerplate, contact line) lives in
 * the lazy `studioShowcase` catalog; the artist's own words (bio, pitch,
 * quotes) render as written. With the stored language set to pt, every
 * query waits with `findBy*`.
 */
describe("StudioPressPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the demo's showcase copy from the pt catalog", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/press?id=demo-persona-mariana-sol"]}
      >
        <StudioPressPage />
      </TestProviders>,
    );

    expect(await screen.findByText("ela / dela")).toBeInTheDocument();
    expect(
      await screen.findByText("Fado · música devocional · canção erudita"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/A Mariana trata da própria imprensa/),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Copiar a biografia" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Copy bio")).toBeNull();
  });
});
