import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DemoModeProvider, useDemoMode } from "./DemoModeProvider";

vi.mock("../../shared/sandbox/sandbox", () => ({
  isSandbox: vi.fn(() => true),
}));

function Probe() {
  const { demoMode, available } = useDemoMode();
  return (
    <span data-testid="probe">{`${demoMode}:${available}`}</span>
  );
}

afterEach(() => vi.clearAllMocks());

describe("DemoModeProvider in a sandbox instance", () => {
  it("forces demo on and locks the toggle", () => {
    render(
      <DemoModeProvider>
        <Probe />
      </DemoModeProvider>,
    );
    // demoMode forced true; available false (toggle locked)
    expect(screen.getByTestId("probe").textContent).toBe("true:false");
  });
});
