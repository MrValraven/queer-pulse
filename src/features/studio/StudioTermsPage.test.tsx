import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioTermsPage } from "./StudioTermsPage";

const showcase = vi.hoisted(() => ({ isOn: false }));
vi.mock("./useStudioShowcase", () => ({
  useStudioShowcase: () => showcase.isOn,
}));

function renderTerms() {
  render(
    <TestProviders initialEntries={["/studio/terms"]}>
      <StudioTermsPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  showcase.isOn = false;
});

describe("Studio terms (live)", () => {
  it("is a short addendum that links the full terms and the privacy policy", async () => {
    renderTerms();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "The short Studio addendum",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read full terms" }),
    ).toHaveAttribute("href", "/policies/terms");
    expect(
      screen.getByRole("link", { name: "Read the privacy policy" }),
    ).toHaveAttribute("href", "/policies/privacy");
    expect(
      screen.getByRole("link", { name: "hello@queerpulse.com" }),
    ).toHaveAttribute("href", "mailto:hello@queerpulse.com");
    expect(
      screen.getByRole("link", { name: "contact our team" }),
    ).toHaveAttribute("href", "/about/contact");
  });

  it("keeps the deed and the licences to the demo", async () => {
    renderTerms();
    await screen.findByRole("heading", { level: 1 });
    expect(
      screen.queryByRole("button", { name: "Read the deed" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /do with the music/i }),
    ).not.toBeInTheDocument();
  });
});

describe("Studio terms (demo)", () => {
  it("adds the deed button and the licence section", async () => {
    showcase.isOn = true;
    renderTerms();
    expect(
      await screen.findByRole("button", { name: "Read the deed" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /do with the music/i }),
    ).toBeInTheDocument();
    // The co-op deal cards contradict the money section, so they stay out.
    expect(
      screen.queryByRole("heading", { name: /keep 80%/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /tips are 100%/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read full terms" }),
    ).toHaveAttribute("href", "/policies/terms");
  });
});
