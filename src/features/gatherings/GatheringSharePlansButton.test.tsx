import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { GatheringSharePlansButton } from "./GatheringSharePlansButton";
import type { GatheringDetail } from "./data";

/**
 * `?share=plans` opens Share plans on arrival (the Go together group sheet
 * links there), and closing it takes the parameter back off the URL. The
 * modal itself is stubbed: only the open and close wiring is under test here.
 *
 * Vitest forces demo mode on through the empty VITE_API_URL, and the button
 * renders nothing in demo, so `useDemoMode` is pinned to live. The full
 * TestProviders tree would render the real DemoModeProvider (which this module
 * mock leaves out) and switch every data provider to live, so the button gets
 * only the router and the translations it reads.
 */

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

const STUB_DIALOG_NAME = "Share plans stub";
const STUB_CLOSE_NAME = "Close stub";

vi.mock("./SharePlansModal", () => ({
  SharePlansModal: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label={STUB_DIALOG_NAME}>
      <button type="button" onClick={onClose}>
        {STUB_CLOSE_NAME}
      </button>
    </div>
  ),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderButton(
  myRsvpStatus: GatheringDetail["myRsvpStatus"],
  initialEntry: string,
) {
  const gathering = {
    slug: "pride-picnic",
    myRsvpStatus,
  } as unknown as GatheringDetail;
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <I18nProvider>
        <GatheringSharePlansButton gathering={gathering} />
        <LocationProbe />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe("GatheringSharePlansButton share plans parameter", () => {
  it("opens Share plans from ?share=plans and removes the parameter on close", () => {
    renderButton("going", "/gatherings/pride-picnic?share=plans&tab=about");
    expect(
      screen.getByRole("dialog", { name: STUB_DIALOG_NAME }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: STUB_CLOSE_NAME }));

    expect(
      screen.queryByRole("dialog", { name: STUB_DIALOG_NAME }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "?tab=about",
    );
  });

  it("ignores the parameter for a member who is not going", () => {
    renderButton(null, "/gatherings/pride-picnic?share=plans");
    expect(
      screen.queryByRole("dialog", { name: STUB_DIALOG_NAME }),
    ).not.toBeInTheDocument();
  });
});
