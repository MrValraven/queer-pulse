import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { CURRENT, PANEL, PAST } from "./microGrants.data";
import { MicroGrantsPage } from "./MicroGrantsPage";

const { demoModeState } = vi.hoisted(() => ({
  demoModeState: { isDemoMode: true },
}));

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: demoModeState.isDemoMode,
    available: false,
    setDemoMode: vi.fn(),
  }),
}));

function renderPage() {
  return render(
    <TestProviders initialEntries={["/work/grants/micro"]}>
      <MicroGrantsPage />
    </TestProviders>,
  );
}

describe("MicroGrantsPage", () => {
  beforeEach(() => {
    demoModeState.isDemoMode = true;
  });

  it("shows the demo round, its amount band and its review panel", () => {
    renderPage();
    expect(screen.getByText("€200 – €2,000")).toBeInTheDocument();
    expect(screen.getByText(PANEL[0]!.title)).toBeInTheDocument();
    expect(screen.getByText("€14,800")).toBeInTheDocument();
  });

  it("hides every invented figure in live mode and keeps the application form", () => {
    demoModeState.isDemoMode = false;
    renderPage();
    expect(screen.queryByText("€200 – €2,000")).toBeNull();
    expect(screen.queryByText("€14,800")).toBeNull();
    expect(screen.queryByText(PANEL[0]!.title)).toBeNull();
    for (const grant of [...CURRENT, ...PAST]) {
      expect(screen.queryByText(grant.name)).toBeNull();
    }
    fireEvent.click(
      screen.getByRole("button", { name: "Start an application" }),
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName();
    expect(screen.getByText("Apply to the community fund")).toBeInTheDocument();
  });
});
