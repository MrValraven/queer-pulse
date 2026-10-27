import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { SampleLineupPanel } from "./SampleLineupPanel";

describe("SampleLineupPanel", () => {
  it("renders one row per entry", () => {
    render(
      <TestProviders>
        <SampleLineupPanel
          title="Lineup"
          entries={[
            { entryId: "one", name: "Rosa Sample", kind: "dj" },
            { entryId: "two", name: "Nico Sample", kind: "drag" },
          ]}
        />
      </TestProviders>,
    );
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Rosa Sample");
    expect(rows[1]).toHaveTextContent("Nico Sample");
  });
});
