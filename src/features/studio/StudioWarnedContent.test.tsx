import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioWarnedContent } from "./StudioWarnedContent";

describe("StudioWarnedContent (spec 6.2)", () => {
  it("covers warned lyrics until the reveal is pressed", () => {
    render(
      <TestProviders>
        <StudioWarnedContent trackId="t-warned" warnings={["self-harm"]}>
          <p>The words</p>
        </StudioWarnedContent>
      </TestProviders>,
    );
    expect(screen.queryByText("The words")).toBeNull();
    const reveal = screen.getByRole("button");
    expect(reveal.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(reveal);
    expect(screen.getByText("The words")).toBeTruthy();
  });

  it("shows unwarned lyrics with no button", () => {
    render(
      <TestProviders>
        <StudioWarnedContent trackId="t-plain" warnings={[]}>
          <p>Plain words</p>
        </StudioWarnedContent>
      </TestProviders>,
    );
    expect(screen.getByText("Plain words")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
