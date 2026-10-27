import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { ShowcaseFrame } from "./ShowcaseFrame";

afterEach(() => {
  localStorage.clear();
});

describe("ShowcaseFrame", () => {
  it("labels the frame and makes its content inert", async () => {
    render(
      <TestProviders>
        <ShowcaseFrame label="Sample card">
          <button type="button">Inside</button>
        </ShowcaseFrame>
      </TestProviders>,
    );
    expect(
      screen.getByRole("figure", { name: "Sample card" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Inside").closest("[inert]")).not.toBeNull();
    const sampleLabel = await screen.findByText("Sample");
    expect(sampleLabel.closest("[inert]")).toBeNull();
  });
});
