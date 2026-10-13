import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioSetPage } from "./StudioSetPage";

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

describe("StudioSetPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the set hero facts and blurb in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioSetPage />
      </TestProviders>,
    );

    expect(await screen.findByText("11 faixas · 58 min")).toBeInTheDocument();
    expect(
      await screen.findByText(/Gravado ao vivo · Casa do Comum · 12\/04\/2026/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/A hora entre o pôr do sol e a segunda garrafa/),
    ).toBeInTheDocument();

    expect(screen.queryByText("11 tracks · 58 min")).toBeNull();
    expect(screen.queryByText(/Recorded live/)).toBeNull();
  });
});
