import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioLiveNow } from "./StudioLiveNow";

/**
 * `StudioLiveNow`'s on-air card carries the interactive logic worth testing:
 * the save toggle flips its own label (Save track ⇄ Saved) through the real
 * `SavedProvider` and confirms with a toast, and the tip button delegates to
 * the `onTip` callback the parent owns (which opens the tip modal). We drive it
 * through `TestProviders` (real Saved + Toast providers, no mocks at that
 * seam), and only stub `useSimulatedLoad` to `false` so the deterministic
 * skeleton delay can't leave a pending timer after the test. Button/toast
 * copy comes from the lazy `studio` catalog, so assertions use `findBy*`.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

beforeEach(() => {
  // The save store is localStorage-backed and persists within a file run;
  // clear it so each test starts from the un-saved state.
  window.localStorage.clear();
});

describe("StudioLiveNow", () => {
  it("toggles the track between Save and Saved, confirming with a toast", async () => {
    render(
      <TestProviders>
        <StudioLiveNow onTip={() => {}} />
      </TestProviders>,
    );

    const saveButton = await screen.findByRole("button", {
      name: /save track/i,
    });
    fireEvent.click(saveButton);

    // Label flips to "Saved" and the save toast surfaces.
    expect(
      await screen.findByRole("button", { name: /^saved$/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Track saved to your library"),
    ).toBeInTheDocument();
  });

  it("delegates tipping to the onTip callback rather than handling it inline", async () => {
    const onTip = vi.fn();
    render(
      <TestProviders>
        <StudioLiveNow onTip={onTip} />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /tip mariana/i }));
    expect(onTip).toHaveBeenCalledTimes(1);
  });
});
