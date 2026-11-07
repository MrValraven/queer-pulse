import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import type { StudioAdminTrackView } from "./api/studioSafety.adapters";
import { resetDemoSafety } from "./api/studioDemoSafety";
import { StudioFlagReviewLive } from "./StudioFlagReviewLive";
import { StudioReviewClaimsPanel } from "./StudioReviewClaimsPanel";
import { StudioReviewClaimsBadge } from "./StudioReviewClaimsBadge";
import { StudioReviewWarningDialog } from "./StudioReviewWarningDialog";

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: true }),
}));

beforeEach(() => resetDemoSafety());

describe("the staff Claims tab (demo)", () => {
  it("badges the two claims waiting", async () => {
    render(
      <TestProviders>
        <StudioReviewClaimsBadge />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    await waitFor(() => expect(screen.getByText("2")).toBeTruthy());
  });

  it("shows the claimant to staff and requires a note to decline", async () => {
    render(
      <TestProviders>
        <StudioReviewClaimsPanel tabButtonId="tab-claims" />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    await waitFor(() => expect(screen.getByText(/Tiago \(@/)).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: /decline claim/i }));
    const dialog = await screen.findByRole("dialog");
    const confirm = Array.from(dialog.querySelectorAll("button")).find(
      (button) => /decline claim/i.test(button.textContent ?? ""),
    );
    expect(
      confirm?.hasAttribute("disabled") ||
        confirm?.getAttribute("aria-disabled") === "true",
    ).toBe(true);
  });

  it("names the Claims tab with its count once, as a sentence", async () => {
    render(
      <TestProviders>
        <StudioFlagReviewLive />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    expect(
      // jsdom's name computation spaces the label apart from the
      // comma that follows it, where a browser reads "Claims, 2 claims waiting".
      await screen.findByRole("tab", { name: /^Claims ?, 2 claims waiting$/ }),
    ).toBeInTheDocument();
  });

  it("tells staff when a claim holds the track offline", async () => {
    render(
      <TestProviders>
        <StudioReviewClaimsPanel tabButtonId="tab-claims" />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    // Both seed claims on Vela acesa, the accepted one and the countered one,
    // keep that track offline; the claim on another artist's track does not.
    for (const claimantLine of [/Inês R\. \(@/, /Téo M\. \(@/]) {
      const card = (await screen.findByText(claimantLine)).closest("article");
      if (!card) throw new Error("the claimant line sits outside its card");
      expect(
        within(card).getByText("Offline for listeners"),
      ).toBeInTheDocument();
    }
    const otherCard = screen.getByText(/Tiago \(@/).closest("article");
    if (!otherCard) throw new Error("the claimant line sits outside its card");
    expect(
      within(otherCard).queryByText("Offline for listeners"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("Offline for listeners")).toHaveLength(2);
  });

  it("accepts without a note, then offers Uphold and Reject while the claim waits for the artist", async () => {
    render(
      <TestProviders>
        <StudioReviewClaimsPanel tabButtonId="tab-claims" />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    const claimant = await screen.findByText(/Tiago \(@/);
    const card = claimant.closest("article");
    if (!card) throw new Error("the claimant line sits outside its card");
    fireEvent.click(within(card).getByRole("button", { name: "Accept claim" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).queryByRole("textbox")).toBeNull();
    const confirm = within(dialog).getByRole("button", {
      name: "Accept claim",
    });
    expect(confirm).not.toBeDisabled();
    fireEvent.click(confirm);
    const accepted = await screen.findByRole("region", {
      name: "Accepted, waiting for the artist",
    });
    // The seeded accepted claim waits there too, so the checks read the card
    // just accepted.
    const acceptedCard = (
      await within(accepted).findByText(/Tiago \(@/)
    ).closest("article");
    if (!acceptedCard)
      throw new Error("the claimant line sits outside its card");
    expect(
      within(acceptedCard).getByRole("button", { name: "Uphold claim" }),
    ).toBeInTheDocument();
    expect(
      within(acceptedCard).getByRole("button", { name: "Reject claim" }),
    ).toBeInTheDocument();
    // Our team's own wording for the status.
    expect(
      within(acceptedCard).getByText("Waiting for the artist"),
    ).toBeTruthy();
  });
});

// The dialog reads only the title and the warnings our team already added.
const WARNING_TRACK = {
  id: "track-warning-test",
  title: "Cantiga para a vizinha",
  staffContentWarnings: [],
} as unknown as StudioAdminTrackView;

describe("the Add content warning dialog", () => {
  it("holds Confirm until a theme is picked, then sends the pick", async () => {
    const onConfirm = vi.fn();
    render(
      <TestProviders>
        <StudioReviewWarningDialog
          track={WARNING_TRACK}
          isPending={false}
          onConfirm={onConfirm}
          onClose={() => {}}
        />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    const confirm = await screen.findByRole("button", { name: "Add warning" });
    expect(confirm).toBeDisabled();
    fireEvent.click(
      await screen.findByRole("button", { name: "Medical detail" }),
    );
    expect(confirm).not.toBeDisabled();
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith(["medical"]);
  });

  it("shows the pending label and keeps both buttons waiting while it sends", async () => {
    render(
      <TestProviders>
        <StudioReviewWarningDialog
          track={WARNING_TRACK}
          isPending
          onConfirm={() => {}}
          onClose={() => {}}
        />
      </TestProviders>,
    );
    await awaitCatalog("studio");
    const confirm = await screen.findByRole("button", { name: "Adding…" });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
