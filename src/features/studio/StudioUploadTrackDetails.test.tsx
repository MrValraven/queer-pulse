import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioUploadTrackDetails } from "./StudioUploadTrackDetails";

const trackFixture = vi.hoisted(() => ({
  track: {
    id: "track-1",
    title: "Cidade dos santos",
    isExplicit: false,
    lyricStanzas: [] as string[][],
    credits: [
      { name: "Ana", role: "Vocals" },
      { name: "Bia", role: "Piano" },
      { name: "Cris", role: "Mix" },
    ],
  },
}));

vi.mock("./api/useStudioTrack", () => ({
  useStudioTrack: () => ({
    track: trackFixture.track,
    loadState: { kind: "ready" },
  }),
}));

vi.mock("./api/useStudioTrackMutations", () => ({
  useUpdateStudioTrack: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

function renderDetails() {
  return render(
    <TestProviders>
      <StudioUploadTrackDetails
        trackId="track-1"
        releaseId="release-1"
        onDone={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("StudioUploadTrackDetails remove credit", () => {
  it("moves focus to the next credit's name field", async () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 2" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Credit 2 name" }),
      ).toHaveFocus(),
    );
    expect(screen.getByRole("textbox", { name: "Credit 2 name" })).toHaveValue(
      "Cris",
    );
  });

  it("moves focus to the previous credit when the last one is removed", async () => {
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 3" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Credit 2 name" }),
      ).toHaveFocus(),
    );
    expect(screen.getByRole("textbox", { name: "Credit 2 name" })).toHaveValue(
      "Bia",
    );
  });

  it("moves focus to Add a credit when the only credit is removed", async () => {
    trackFixture.track.credits = [{ name: "Ana", role: "Vocals" }];
    renderDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove credit 1" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add a credit" }),
      ).toHaveFocus(),
    );
  });
});
