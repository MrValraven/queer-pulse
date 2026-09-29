import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_STAGES } from "../data/desk.data";
import { STAGE_STEP, STAGE_STEP_COUNT } from "./deskTones";
import { StagePill } from "./StagePill";
import { StageProgress } from "./StageProgress";

describe("STAGE_STEP", () => {
  it("numbers the stages in DEMO_STAGES order, starting at 1", () => {
    DEMO_STAGES.forEach((stage, stageIndex) => {
      expect(STAGE_STEP[stage]).toBe(stageIndex + 1);
    });
    expect(STAGE_STEP_COUNT).toBe(DEMO_STAGES.length);
  });
});

describe("StageProgress", () => {
  it("announces the stage and its step as one image", async () => {
    render(
      <TestProviders>
        <StageProgress stage="Layout" />
      </TestProviders>,
    );

    const progress = await screen.findByRole("img", {
      name: "Layout, step 6 of 8",
    });
    expect(progress).toHaveAttribute("data-stage-step", "6");
  });

  it("draws eight segments whichever variant it uses", async () => {
    render(
      <TestProviders>
        <StageProgress stage="Drafting" variant="bar" size="sm" />
      </TestProviders>,
    );

    const progress = await screen.findByRole("img");
    const track = progress.firstElementChild;
    expect(track?.children).toHaveLength(8);
  });

  it("prints the translated stage name only when asked", async () => {
    const { rerender } = render(
      <TestProviders>
        <StageProgress stage="Sensitivity read" />
      </TestProviders>,
    );
    const progress = await screen.findByRole("img");
    expect(progress).not.toHaveTextContent("Sensitivity read");

    rerender(
      <TestProviders>
        <StageProgress stage="Sensitivity read" showLabel />
      </TestProviders>,
    );
    expect(await screen.findByRole("img")).toHaveTextContent(
      "Sensitivity read",
    );
  });
});

describe("StagePill", () => {
  it("keeps its label and names its step on the shared scale", async () => {
    render(
      <TestProviders>
        <StagePill stage="Published" />
      </TestProviders>,
    );

    const pill = await screen.findByText("Published");
    expect(pill).toHaveAttribute("data-stage-step", "8");
  });
});
