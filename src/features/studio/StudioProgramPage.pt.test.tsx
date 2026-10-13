import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioProgramPage } from "./StudioProgramPage";

/**
 * The programming desk is demo-only, so its slate and inbox come from
 * `studioProgram.data.tsx`. With the language set to Portuguese, the bylines,
 * badges, curator notes and submission quotes resolve through the
 * `studioShowcase` catalog. Catalogs load lazily, so every query is `findBy*`.
 */
describe("StudioProgramPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the slate and the inbox copy from the Portuguese catalog", async () => {
    render(
      <TestProviders>
        <StudioProgramPage />
      </TestProviders>,
    );

    expect(await screen.findByText("oito vozes · Porto")).toBeInTheDocument();
    expect(await screen.findByText("sem alterações")).toBeInTheDocument();
    expect(
      await screen.findByText("Fica até ao segundo verso da faixa seis."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "dois minutos e quarenta e seis segundos. um piano e uma fogueira pequenina",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByDisplayValue(
        "Quinze vozes trans, gravadas ao vivo numa cozinha. Sem reverb. Sem edições.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText("eight voices · Porto")).not.toBeInTheDocument();
    expect(screen.queryByText("no change")).not.toBeInTheDocument();
  });
});
