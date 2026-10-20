import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioOwnerClaimView } from "./api/studioSafetyFields";
import { StudioClaimPanel } from "./StudioClaimPanel";

const mutate = vi.fn();
vi.mock("./api/useStudioOwnerClaimMutations", () => ({
  useCounterStudioClaim: () => ({
    mutate,
    isPending: false,
    error: null,
    reset: () => {},
  }),
}));

const held: StudioOwnerClaimView = {
  id: "claim-1",
  trackId: "track-2",
  status: "accepted",
  originalWork: "Candeia, by Rosa Marinho",
  originalLink: "https://example.org/candeia",
  details: "The chorus from 0:40",
  claimantRole: "rights_holder",
  counterNote: null,
  claimantReply: null,
  staffNote: null,
  acceptedAt: "2026-10-10T14:00:00.000Z",
  counteredAt: null,
  decidedAt: null,
  canCounter: true,
  isHolding: true,
};

function renderPanel(claim: StudioOwnerClaimView) {
  return render(
    <TestProviders>
      <StudioClaimPanel
        claim={claim}
        trackTitle="Vela acesa"
        releaseId="release-1"
      />
    </TestProviders>,
  );
}

beforeEach(() => mutate.mockReset());

describe("StudioClaimPanel", () => {
  it("shows what was claimed and never who claimed it", () => {
    const { container } = renderPanel(held);
    expect(screen.getByText("Candeia, by Rosa Marinho")).toBeTruthy();
    expect(screen.getByText("The chorus from 0:40")).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/claimant[A-Z_]?id|member/i);
  });

  it("sends a counter-notice only with a note and the good-faith box", async () => {
    renderPanel(held);
    fireEvent.click(
      screen.getByRole("button", { name: /write a counter-notice/i }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /send counter-notice/i }),
    );
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "I wrote this melody in 2019" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(
      screen.getByRole("button", { name: /send counter-notice/i }),
    );
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          claim: held,
          releaseId: "release-1",
          note: "I wrote this melody in 2019",
        },
        expect.anything(),
      ),
    );
  });

  it("offers no counter-notice once one is sent, and shows the outcome when decided", () => {
    renderPanel({
      ...held,
      status: "rejected",
      canCounter: false,
      isHolding: false,
      counterNote: "Mine",
      staffNote: "The melodies differ",
      decidedAt: "2026-10-13T10:00:00.000Z",
    });
    expect(
      screen.queryByRole("button", { name: /write a counter-notice/i }),
    ).toBeNull();
    expect(screen.getByText("The melodies differ")).toBeTruthy();
    expect(screen.getByText(/our team rejected the claim/i)).toBeTruthy();
    expect(screen.getByText(/claim rejected, back online/i)).toBeTruthy();
  });

  it("leaves the offline banner to the one line above the panels", () => {
    renderPanel(held);
    expect(screen.queryByText(/this track is offline/i)).toBeNull();
  });

  it("words the chip for the artist and says Held since only while holding", () => {
    renderPanel(held);
    expect(screen.getByText(/offline while our team reviews/i)).toBeTruthy();
    expect(screen.getByText(/^held since/i)).toBeTruthy();
  });

  it("dates an accepted claim that no longer holds the track", () => {
    renderPanel({ ...held, status: "upheld", isHolding: false });
    expect(screen.getByText(/^claim upheld$/i)).toBeTruthy();
    expect(screen.queryByText(/^held since/i)).toBeNull();
    expect(screen.getByText(/^accepted /i)).toBeTruthy();
  });
});
