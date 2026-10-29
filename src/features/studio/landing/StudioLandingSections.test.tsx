import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
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
  it("comparison has nine rows, each with a topic and three answers", async () => {
    const section = await renderSection(<StudioLandingComparison />, /Spotify/);
    const rows = within(section).getAllByRole("listitem");
    expect(rows).toHaveLength(9);
    rows.forEach((row) => {
      expect(within(row).getAllByRole("heading", { level: 3 })).toHaveLength(1);
      expect(row.querySelectorAll("p")).toHaveLength(3);
    });
  });

  it("each answer begins with its full column name", async () => {
    const section = await renderSection(<StudioLandingComparison />, /Spotify/);
    within(section)
      .getAllByRole("listitem")
      .forEach((row) => {
        const answers = [...row.querySelectorAll("p")];
        expect(answers[0]!.textContent).toMatch(
          /^Streaming apps \(Spotify, Apple Music\): /,
        );
        expect(answers[1]!.textContent).toMatch(
          /^Artist platforms \(Bandcamp, SoundCloud\): /,
        );
        expect(answers[2]!.textContent).toMatch(/^QueerPulse Studio: /);
      });
  });

  it("comparison short labels are hidden from screen readers", async () => {
    const section = await renderSection(<StudioLandingComparison />, /Spotify/);
    const firstRow = within(section).getAllByRole("listitem")[0]!;
    const hiddenLabels = [
      ...firstRow.querySelectorAll('[aria-hidden="true"]'),
    ].map((element) => element.textContent);
    expect(hiddenLabels).toContain("Streaming apps");
    expect(hiddenLabels).toContain("Artist platforms");
    expect(hiddenLabels).toContain("Studio");
  });

  it("the stage name row says the persona link stays hidden", async () => {
    const section = await renderSection(<StudioLandingComparison />, /Spotify/);
    const stageNameRow = within(section)
      .getAllByRole("listitem")
      .find((row) =>
        within(row).queryByRole("heading", {
          level: 3,
          name: "Your stage name",
        }),
      );
    const studioAnswer = stageNameRow?.querySelectorAll("p")[2];
    expect(studioAnswer?.textContent).toContain(
      "A persona inside your account, and no other member can see the link",
    );
  });

  it("comparison opens on Spotify and carries no figures", async () => {
    const section = await renderSection(<StudioLandingComparison />, /Spotify/);
    const heading = within(section).getByRole("heading", { level: 2 });
    expect(heading.textContent).toContain("Keep Spotify for everything else");
    expect(section.textContent).not.toMatch(FIGURES);
  });

  it("the plan is labelled and holds three points", async () => {
    const section = await renderSection(<StudioLandingPlan />, /Studio/i);
    expect(section.textContent).toContain("The plan");
    expect(section.textContent).toContain("Coming later");
    expect(within(section).getAllByRole("listitem")).toHaveLength(3);
    expect(within(section).getAllByRole("heading", { level: 3 })).toHaveLength(
      3,
    );
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
