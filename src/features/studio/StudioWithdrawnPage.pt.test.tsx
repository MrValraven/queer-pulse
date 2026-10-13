import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioWithdrawnPage } from "./StudioWithdrawnPage";

describe("StudioWithdrawnPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the still available cards in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioWithdrawnPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Mariana Sol · 11 faixas"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Coleção · 14 faixas")).toBeInTheDocument();
    expect(await screen.findByText("Artista · Sintra")).toBeInTheDocument();
    expect(await screen.findByText("Todos os lançamentos")).toBeInTheDocument();

    expect(screen.queryByText("Collection · 14 tracks")).toBeNull();
    expect(screen.queryByText("All releases")).toBeNull();
  });
});
