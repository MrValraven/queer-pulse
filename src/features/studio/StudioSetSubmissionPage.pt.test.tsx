import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioSetSubmissionPage } from "./StudioSetSubmissionPage";

describe("StudioSetSubmissionPage in Portuguese", () => {
  beforeEach(() => {
    window.localStorage.setItem("qp.lang", "pt");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the unidentified tracks and file facts in pt-PT", async () => {
    render(
      <TestProviders>
        <StudioSetSubmissionPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("edit pirata desconhecido"),
    ).toBeInTheDocument();
    expect(await screen.findByText("white label: ID / ID")).toBeInTheDocument();
    expect(
      await screen.findByText(/sonoridade −9\.2 LUFS/),
    ).toBeInTheDocument();
    expect(
      await screen.findByDisplayValue(/12:18 {2}\(edit pirata desconhecido\)/),
    ).toBeInTheDocument();

    expect(screen.queryByText("unknown bootleg edit")).toBeNull();
    expect(screen.queryByText(/loudness/)).toBeNull();
  });
});
