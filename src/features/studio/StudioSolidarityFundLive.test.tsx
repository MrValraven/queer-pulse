import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioSolidarityFundLive } from "./StudioSolidarityFundLive";

describe("solidarity page (live)", () => {
  it("says QueerPulse never handles money and links to music fundraisers", () => {
    render(
      <TestProviders>
        <StudioSolidarityFundLive />
      </TestProviders>,
    );
    expect(
      screen.getByText(/QueerPulse never handles money/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /see music fundraisers/i }),
    ).toHaveAttribute(
      "href",
      "/forum?category=funding&fundingView=asks&tag=music",
    );
    expect(
      screen.getByRole("link", { name: "Start a fundraiser" }),
    ).toHaveAttribute("href", "/forum/new?tag=music");
    expect(
      screen.getByRole("link", { name: "See open calls for music" }),
    ).toHaveAttribute("href", "/studio/calls");
  });
});
