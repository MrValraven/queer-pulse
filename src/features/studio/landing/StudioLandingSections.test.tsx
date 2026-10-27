import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { StudioLandingPromises } from "./StudioLandingPromises";
import { StudioLandingComparison } from "./StudioLandingComparison";
import { StudioLandingPlan } from "./StudioLandingPlan";
import { StudioLandingManifesto } from "./StudioLandingManifesto";

const FIGURES = /€|\d+\s?%/;

async function renderSection(element: ReactElement, name: RegExp) {
  render(<TestProviders>{element}</TestProviders>);
  const heading = await screen.findByRole("heading", { level: 2, name });
  return heading.closest("section") as HTMLElement;
}

describe("Studio landing sections", () => {
  it("promises render four items, each with an h3", async () => {
    const section = await renderSection(<StudioLandingPromises />, /artists/i);
    expect(within(section).getAllByRole("listitem")).toHaveLength(4);
    const itemHeadings = within(section).getAllByRole("heading", { level: 3 });
    expect(itemHeadings).toHaveLength(4);
    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Safe by design",
      }),
    ).toBeTruthy();
  });

  it("comparison has seven rows, each with both answers", async () => {
    const section = await renderSection(
      <StudioLandingComparison />,
      /streaming apps/i,
    );
    const rows = within(section).getAllByRole("listitem");
    expect(rows).toHaveLength(7);
    rows.forEach((row) => {
      expect(within(row).getAllByRole("heading", { level: 3 })).toHaveLength(1);
      expect(row.querySelectorAll("p")).toHaveLength(2);
    });
    const listeningRow = rows.find((row) =>
      within(row).queryByRole("heading", { name: "Your listening" }),
    );
    expect(listeningRow?.textContent).toContain(
      "Your listening history is private to you",
    );
  });

  it("comparison short labels are hidden from screen readers", async () => {
    const section = await renderSection(
      <StudioLandingComparison />,
      /streaming apps/i,
    );
    const firstRow = within(section).getAllByRole("listitem")[0]!;
    const hiddenLabels = [
      ...firstRow.querySelectorAll('[aria-hidden="true"]'),
    ].map((element) => element.textContent);
    expect(hiddenLabels).toContain("Big apps");
    expect(hiddenLabels).toContain("Studio");
    expect(firstRow.textContent).toContain(
      "Big streaming apps (Spotify and others): ",
    );
    expect(firstRow.textContent).toContain("QueerPulse Studio: ");
  });

  it("comparison carries no figures", async () => {
    const section = await renderSection(
      <StudioLandingComparison />,
      /streaming apps/i,
    );
    expect(section.textContent).not.toMatch(FIGURES);
  });

  it("the plan is labelled", async () => {
    const section = await renderSection(<StudioLandingPlan />, /Studio/i);
    expect(section.textContent).toContain("The plan");
    expect(section.textContent).toContain("Coming later");
    expect(section.textContent).not.toMatch(FIGURES);
  });

  it("the manifesto quote is a heading", async () => {
    render(
      <TestProviders>
        <StudioLandingManifesto />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /A scene sounds like itself/,
      }),
    ).toBeTruthy();
  });
});
