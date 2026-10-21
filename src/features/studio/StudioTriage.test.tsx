import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioTriageList } from "./StudioTriageList";
import { StudioTriagePage } from "./StudioTriagePage";

/**
 * Studio is demo-only in live, so the council triage surface has no adapter,
 * only its interaction. The page's detail follows the picked row and records
 * a curator's decision into a live `role="status"` region (plus the note they
 * typed), and `StudioTriageList` shows a recoverable empty state when a tab
 * filters everything out, whose action calls back to reset the tab. The list
 * reads `useSimulatedLoad`, so we stub it to `false` to skip the skeleton and
 * its timer. Copy is the lazy `studio` catalog → `findBy*`.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

describe("StudioTriageDetail", () => {
  it("records a pass decision, surfacing the curator's note in the status region", async () => {
    render(
      <TestProviders>
        <StudioTriagePage />
      </TestProviders>,
    );

    // Scope status queries to the triage panel (an <aside> named "Selected
    // submission"): the always-mounted Toast live region also carries
    // role="status", so an unscoped query would match it too.
    const panel = await screen.findByRole("complementary", {
      name: "Selected submission",
    });

    // No decision recorded yet: the live region is there, and empty.
    expect(within(panel).getByRole("status")).toBeEmptyDOMElement();

    fireEvent.change(
      await screen.findByLabelText(/a small sentence that explains the no/i),
      { target: { value: "So close, the bridge undoes it" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: /pass with your note/i }),
    );

    // The decision and the typed note both land in the live status region.
    const status = await within(panel).findByRole("status");
    expect(status).toHaveTextContent(
      "Passed with your sentence, sent to Renato",
    );
    expect(status).toHaveTextContent("So close, the bridge undoes it");
  });

  it("records a hold decision in the status region", async () => {
    render(
      <TestProviders>
        <StudioTriagePage />
      </TestProviders>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /hold & second-read/i }),
    );
    // Scope to the triage panel so the assertion targets its decision status
    // region; the always-mounted Toast live region also has role="status".
    const panel = await screen.findByRole("complementary", {
      name: "Selected submission",
    });
    expect(await within(panel).findByRole("status")).toHaveTextContent(
      "Held for a second read",
    );
  });
});

describe("StudioTriagePage", () => {
  it("shows the picked submission in the detail", async () => {
    render(
      <TestProviders>
        <StudioTriagePage />
      </TestProviders>,
    );
    const panel = await screen.findByRole("complementary", {
      name: "Selected submission",
    });
    expect(within(panel).getByRole("heading", { level: 2 })).toHaveTextContent(
      "The piano I waited for",
    );
    const coroRow = (
      await screen.findByText("Porto", { selector: "em" })
    ).closest('[role="button"]');
    if (!coroRow) throw new Error("the Coro de Porto row is missing");
    fireEvent.click(coroRow);
    expect(
      await screen.findByRole("heading", { level: 2, name: "Coro de Porto" }),
    ).toBeInTheDocument();
    expect(coroRow).toHaveAttribute("aria-pressed", "true");
  });
});

describe("StudioTriageList", () => {
  it("shows a recoverable empty state for a filtered-empty tab", async () => {
    const onBackToNew = vi.fn();
    render(
      <TestProviders>
        <StudioTriageList tab="shortlisted" onBackToNew={onBackToNew} />
      </TestProviders>,
    );

    expect(
      await screen.findByText("Nothing in this queue"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /back to new/i }));
    expect(onBackToNew).toHaveBeenCalledTimes(1);
  });
});
