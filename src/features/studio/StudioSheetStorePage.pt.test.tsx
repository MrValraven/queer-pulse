import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioSheetStorePage } from "./StudioSheetStorePage";

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

describe("StudioSheetStorePage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the sheet specs, checkout line and transcriber cards in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioSheetStorePage />
      </TestProviders>,
    );

    expect(await screen.findByText("Voz + piano")).toBeInTheDocument();
    expect(await screen.findByText("Tom · ré menor")).toBeInTheDocument();
    expect(
      await screen.findByText("Mariana Sol · voz e piano · ré menor"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("voz + piano · 4 páginas"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Akin Diallo · tablatura de guitarra"),
    ).toBeInTheDocument();

    expect(screen.queryByText("Voice + piano")).toBeNull();
    expect(screen.queryByText("Akin Diallo · guitar tab")).toBeNull();
  });
});
