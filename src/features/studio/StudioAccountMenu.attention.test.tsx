import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioAccountMenu } from "./StudioAccountMenu";

const state = vi.hoisted(() => ({ hasAttention: false }));
vi.mock("./useStudioMenuAttention", () => ({
  useStudioMenuAttention: () => ({ hasAttention: state.hasAttention }),
}));

beforeEach(() => {
  state.hasAttention = false;
});

function renderMenu() {
  return render(
    <TestProviders>
      <StudioAccountMenu triggerLabel="Your account, Rui" />
    </TestProviders>,
  );
}

describe("StudioAccountMenu attention dot", () => {
  it("adds the attention phrase to the trigger name and shows the dot", () => {
    state.hasAttention = true;
    renderMenu();
    expect(
      screen.getByRole("button", {
        name: "Your account, Rui, something needs your attention",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("studio-attention-dot")).toBeInTheDocument();
  });

  it("keeps the plain trigger name and hides the dot without a count", () => {
    renderMenu();
    expect(
      screen.getByRole("button", { name: "Your account, Rui" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("studio-attention-dot")).toBeNull();
  });
});
