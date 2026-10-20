import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
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
    await waitFor(() => expect(screen.getByText("2")).toBeTruthy());
  });

  it("shows the claimant to staff and requires a note to decline", async () => {
    render(
      <TestProviders>
        <StudioReviewClaimsPanel tabButtonId="tab-claims" />
      </TestProviders>,
    );
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
    expect(
      await screen.findByRole("tab", { name: "Claims, 2 claims waiting" }),
    ).toBeInTheDocument();
  });

  it("tells staff when a claim holds the track offline", async () => {
    render(
      <TestProviders>
        <StudioReviewClaimsPanel tabButtonId="tab-claims" />
      </TestProviders>,
    );
    // The countered seed claim keeps its track offline.
    expect(await screen.findByText("Offline for listeners")).toBeTruthy();
  });

  it("accepts without a note, then offers Uphold and Reject while the claim waits for the artist", async () => {
    render(
      <TestProviders>
        <StudioReviewClaimsPanel tabButtonId="tab-claims" />
      </TestProviders>,
    );
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
    await waitFor(() =>
      expect(within(accepted).getByText(/Tiago \(@/)).toBeTruthy(),
    );
    expect(
      within(accepted).getByRole("button", { name: "Uphold claim" }),
    ).toBeInTheDocument();
    expect(
      within(accepted).getByRole("button", { name: "Reject claim" }),
    ).toBeInTheDocument();
    // Our team's own wording for the status.
    expect(within(accepted).getByText("Waiting for the artist")).toBeTruthy();
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
    const confirm = await screen.findByRole("button", { name: "Adding…" });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
