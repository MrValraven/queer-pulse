import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioRightsPage } from "./StudioRightsPage";

describe("StudioRightsPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the release facts and licence badges in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioRightsPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText(
        "Álbum · 11 faixas · 2026 · 142 mil reproduções · 7100 € pagos",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Gravação ao vivo · 2024 · disputa de direitos em 2 faixas",
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText("Todos os direitos")).toBeInTheDocument();

    expect(
      screen.queryByText(
        "Live recording · 2024 · clearance dispute on 2 tracks",
      ),
    ).toBeNull();
    expect(screen.queryByText("All rights")).toBeNull();
  });
});
