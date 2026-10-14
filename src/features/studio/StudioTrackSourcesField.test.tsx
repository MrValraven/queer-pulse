import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioSource } from "./api/studio.types";
import { StudioTrackSourcesField } from "./StudioTrackSourcesField";

function Harness({ initial }: { initial: StudioSource[] }) {
  const [sources, setSources] = useState(initial);
  return (
    <>
      <StudioTrackSourcesField
        sources={sources}
        onChange={setSources}
        showErrors={false}
      />
      <output data-testid="value">{JSON.stringify(sources)}</output>
    </>
  );
}

describe("StudioTrackSourcesField", () => {
  it("adds, fills and removes sources", async () => {
    render(
      <TestProviders>
        <Harness initial={[]} />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add source" }));
    fireEvent.change(
      await screen.findByRole("textbox", { name: "Song title 1" }),
      {
        target: { value: "Vogue" },
      },
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Artist 1" }), {
      target: { value: "Madonna" },
    });
    expect(screen.getByTestId("value").textContent).toBe(
      JSON.stringify([{ title: "Vogue", artist: "Madonna" }]),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove source 1" }));
    expect(screen.getByTestId("value").textContent).toBe("[]");
  });

  it("flags a half-filled row when asked", () => {
    render(
      <TestProviders>
        <StudioTrackSourcesField
          sources={[{ title: "Vogue", artist: "" }]}
          onChange={() => {}}
          showErrors
        />
      </TestProviders>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Fill in the song title and the artist on every row, or remove the row",
    );
    expect(screen.getByRole("textbox", { name: "Artist 1" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("focuses the new row's song title after Add source", async () => {
    render(
      <TestProviders>
        <Harness initial={[{ title: "Vogue", artist: "Madonna" }]} />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add source" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Song title 2" }),
      ).toHaveFocus(),
    );
  });

  it("folds away the removed middle row and keeps the others", () => {
    const { container } = render(
      <TestProviders>
        <Harness
          initial={[
            { title: "Alpha", artist: "One" },
            { title: "Bravo", artist: "Two" },
            { title: "Charlie", artist: "Three" },
          ]}
        />
      </TestProviders>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove source 2" }));
    expect(screen.getByTestId("value").textContent).toBe(
      JSON.stringify([
        { title: "Alpha", artist: "One" },
        { title: "Charlie", artist: "Three" },
      ]),
    );
    const leavingTitles = [
      ...container.querySelectorAll<HTMLInputElement>(
        "li[inert] input[data-source-title]",
      ),
    ].map((input) => input.value);
    expect(leavingTitles).toEqual(["Bravo"]);
    const presentTitles = [
      ...container.querySelectorAll<HTMLInputElement>(
        "li:not([inert]) input[data-source-title]",
      ),
    ].map((input) => input.value);
    expect(presentTitles).toEqual(["Alpha", "Charlie"]);
  });
});
