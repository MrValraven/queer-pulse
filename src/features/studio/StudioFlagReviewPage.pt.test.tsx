import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioFlagReviewPage } from "./StudioFlagReviewPage";

/**
 * The flag review page renders its demo flags in Portuguese when the reader
 * picks PT: categories, the who and reporter lines, flag counts and deadlines
 * all resolve through the `studioShowcase` catalog. The page reads
 * `useSimulatedLoad`, so we stub it to `false` to render the real flag cards
 * immediately. Catalogs load lazily, hence `findBy*`.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

describe("StudioFlagReviewPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the flag cards and the resolved card in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioFlagReviewPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Possível amostra não autorizada"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Sinalizado por 2 ouvintes · pedimos à pessoa artista que responda",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Gravado ao vivo · Casa do Comum · 7 artistas"),
    ).toBeInTheDocument();
    expect(await screen.findByText("decidir até 19 Jun")).toBeInTheDocument();
    expect(
      await screen.findByText("João Ribeiro · resolvido a 6 Jun"),
    ).toBeInTheDocument();

    expect(screen.queryByText("Possible uncleared sample")).toBeNull();
    expect(
      screen.queryByText("Recorded live · Casa do Comum · 7 artists"),
    ).toBeNull();
  });
});
