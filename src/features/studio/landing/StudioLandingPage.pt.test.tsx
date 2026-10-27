import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../../marketing/cookies.data";
import { TestProviders } from "../../../test/TestProviders";
import { StudioLandingPage } from "./StudioLandingPage";

/**
 * The landing renders from the lazy `studio` catalog, so with the language
 * stored as pt every query is a `findBy*` against the pt-PT value.
 */

beforeEach(() => {
  localStorage.setItem("qp.lang", "pt");
  localStorage.setItem(AUTH_STORAGE_KEY, "false");
});

afterEach(() => {
  localStorage.clear();
});

describe("StudioLandingPage in Portuguese", () => {
  it("renders the call to action, the plan and the gallery in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioLandingPage />
      </TestProviders>,
    );

    expect(
      (await screen.findAllByText("Pedir um convite")).length,
    ).toBeGreaterThan(0);
    expect(await screen.findByText("O plano")).toBeInTheDocument();
    expect(await screen.findByText("Mais tarde")).toBeInTheDocument();
    expect(
      await screen.findByRole("tablist", { name: "Ecrãs do Studio" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Request an invite")).toBeNull();
  });
});
