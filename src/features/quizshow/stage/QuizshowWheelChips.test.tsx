import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import {
  QuizshowWheelBonusChip,
  QuizshowWheelContentChip,
  QuizshowWheelKindLabel,
  QuizshowWheelSwatch,
} from "./QuizshowWheelChips";

describe("QuizshowWheelBonusChip", () => {
  it("reads +500 by default", async () => {
    render(
      <TestProviders>
        <QuizshowWheelBonusChip points={500} />
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByText("+500")).toBeInTheDocument();
  });

  it("reads +500 bonus with the phone label key", async () => {
    render(
      <TestProviders>
        <QuizshowWheelBonusChip
          points={500}
          labelKey="quizshow:player.wheel.bonusChip"
        />
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByText("+500 bonus")).toBeInTheDocument();
  });
});

describe("QuizshowWheelContentChip", () => {
  it("renders nothing for none", async () => {
    const { container } = render(
      <TestProviders>
        <div data-testid="host">
          <QuizshowWheelContentChip contentLabel="none" />
        </div>
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByTestId("host")).toBeEmptyDOMElement();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("names the Spicy label for spicy", async () => {
    render(
      <TestProviders>
        <QuizshowWheelContentChip contentLabel="spicy" />
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByText("Spicy")).toBeInTheDocument();
  });
});

describe("QuizshowWheelKindLabel", () => {
  it("reads Quiz for a quiz slice", async () => {
    render(
      <TestProviders>
        <QuizshowWheelKindLabel kind="quiz" />
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByText("Quiz")).toBeInTheDocument();
  });

  it("reads Party for a drag name slice", async () => {
    render(
      <TestProviders>
        <QuizshowWheelKindLabel kind="drag_name" />
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByText("Party")).toBeInTheDocument();
  });
});

describe("QuizshowWheelSwatch", () => {
  const tones = ["plum", "rose", "bonus", "bonusAlt"] as const;

  function renderSwatches(): HTMLSpanElement[] {
    const { container } = render(
      <div>
        {tones.map((tone) => (
          <QuizshowWheelSwatch key={tone} tone={tone} />
        ))}
      </div>,
    );
    return Array.from(container.querySelectorAll("span"));
  }

  it("gives each tone its own marker and hides itself from assistive tech", () => {
    const swatches = renderSwatches();
    expect(swatches.map((swatch) => swatch.dataset.tone)).toEqual([...tones]);
    expect(
      swatches.every((swatch) => swatch.getAttribute("aria-hidden") === "true"),
    ).toBe(true);
  });

  it("gives each tone its own non-empty colour class beside the shared one", () => {
    const swatches = renderSwatches();
    const sharedClass = swatches[0]?.classList.item(0) ?? "";
    expect(sharedClass).not.toBe("");
    const toneClasses = swatches.map((swatch) => {
      expect(swatch.classList).toHaveLength(2);
      expect(swatch.classList.item(0)).toBe(sharedClass);
      return swatch.classList.item(1) ?? "";
    });
    expect(toneClasses.every((toneClass) => toneClass.length > 0)).toBe(true);
    expect(new Set(toneClasses).size).toBe(tones.length);
    expect(toneClasses).not.toContain(sharedClass);
  });
});
