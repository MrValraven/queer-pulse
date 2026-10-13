import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioWelcomePage } from "./StudioWelcomePage";

/**
 * The welcome wizard reads its chrome from the lazy `studio` catalog; with the
 * language stored as pt, the step controls and the tip notes render in pt-PT.
 */

beforeEach(() => {
  window.localStorage.setItem("qp.lang", "pt");
});

afterEach(() => {
  window.localStorage.clear();
});

describe("StudioWelcomePage in Portuguese", () => {
  it("renders the wizard chrome and the tip step in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioWelcomePage />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Seguinte" }));

    expect(await screen.findByText("um aceno")).toBeInTheDocument();
    expect(await screen.findByText("um disco")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Saltar" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("a nod")).toBeNull();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });
});
