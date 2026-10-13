import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioReceiptPage } from "./StudioReceiptPage";

/**
 * The receipt's card summary and the tipper's note with the artist's reply
 * live in the lazy `studioShowcase` catalog, so every query uses `findBy*`.
 */
describe("StudioReceiptPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the card summary and the note from the pt catalog", async () => {
    render(
      <TestProviders>
        <StudioReceiptPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("faz por merecer, mariana"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/adoro-te e estou a fazer por merecer, prometo/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Cartão guardado · termina em 4242/),
    ).toBeInTheDocument();

    expect(screen.queryByText("earn it, mariana")).toBeNull();
    expect(screen.queryByText(/Saved card/)).toBeNull();
  });
});
