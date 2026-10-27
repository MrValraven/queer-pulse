import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioSignInPage } from "./StudioSignInPage";

/**
 * The logged-out Studio entry pages render their chrome from the lazy
 * `studio` catalog, so with the language stored as pt every query is a
 * `findBy*` against the pt-PT value.
 */

beforeEach(() => {
  window.localStorage.setItem("qp.lang", "pt");
});

afterEach(() => {
  window.localStorage.clear();
});

describe("StudioSignInPage in Portuguese", () => {
  it("renders the sign-in pane in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioSignInPage />
      </TestProviders>,
    );

    expect(
      await screen.findByRole("button", { name: "Junta-te" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Ainda não tens conta?"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Continuar com o Google"),
    ).toBeInTheDocument();
    expect(screen.queryByText("New here?")).toBeNull();
    expect(screen.queryByText("Continue with Google")).toBeNull();
  });
});
