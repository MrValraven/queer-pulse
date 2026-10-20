import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createStudioPlayerValue,
  queueItem,
  renderWithPlayer,
} from "./studioPlayerTestHarness";
import { StudioWarningGate } from "./StudioWarningGate";

const warned = queueItem({
  trackId: "w1",
  title: "Família",
  contentWarnings: ["family-rejection", "self-harm"],
});

describe("StudioWarningGate (spec 6.3)", () => {
  it("names the next track and its warnings, with Play it and Skip", () => {
    const player = createStudioPlayerValue({
      currentItem: warned,
      pendingWarning: warned,
    });
    renderWithPlayer(<StudioWarningGate />, { player });
    expect(screen.getAllByText(/Família/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/self-harm/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /play it/i }));
    expect(player.playWarnedTrack).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /skip/i }));
    expect(player.skipWarnedTrack).toHaveBeenCalledTimes(1);
  });

  it("shows nothing while no warned track waits", () => {
    renderWithPlayer(<StudioWarningGate />, {
      player: createStudioPlayerValue({ pendingWarning: null }),
    });
    expect(screen.queryByRole("button", { name: /play it/i })).toBeNull();
  });

  it("keeps focus off the body after pressing Skip", () => {
    const player = createStudioPlayerValue({
      currentItem: warned,
      pendingWarning: warned,
    });
    renderWithPlayer(<StudioWarningGate />, { player });
    const skipButton = screen.getByRole("button", { name: /skip/i });
    skipButton.focus();
    fireEvent.click(skipButton);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("names the waiting track without calling it next", () => {
    const player = createStudioPlayerValue({
      currentItem: warned,
      pendingWarning: warned,
    });
    renderWithPlayer(<StudioWarningGate />, { player });
    expect(screen.queryByText(/^Next:/)).toBeNull();
  });

  it("labels its region by the visible line alone", () => {
    const player = createStudioPlayerValue({
      currentItem: warned,
      pendingWarning: warned,
    });
    const { container } = renderWithPlayer(<StudioWarningGate />, { player });
    const region = container.querySelector("section");
    expect(region?.hasAttribute("aria-labelledby")).toBe(true);
    expect(region?.hasAttribute("aria-label")).toBe(false);
  });

  it.each([
    ["Play it", /play it/i],
    ["Skip", /skip/i],
  ])(
    "moves focus to the surface's transport play button after %s",
    (_answerName, answerPattern) => {
      const player = createStudioPlayerValue({
        currentItem: warned,
        pendingWarning: warned,
      });
      renderWithPlayer(
        <div data-studio-player-surface="">
          <div data-studio-transport="">
            {/* As in StudioTransport: the skips sit in slot spans, the
                play button is the row's own button. */}
            <div>
              <span>
                <button type="button">Previous</button>
              </span>
              <button type="button">Transport play</button>
            </div>
          </div>
          <StudioWarningGate />
        </div>,
        { player },
      );
      fireEvent.click(screen.getByRole("button", { name: answerPattern }));
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Transport play" }),
      );
    },
  );

  it("moves focus to a marked play toggle, as on the mini player", () => {
    const player = createStudioPlayerValue({
      currentItem: warned,
      pendingWarning: warned,
    });
    renderWithPlayer(
      <div data-studio-player-surface="">
        <StudioWarningGate />
        <button type="button" data-studio-play-toggle="">
          Mini play
        </button>
      </div>,
      { player },
    );
    fireEvent.click(screen.getByRole("button", { name: /play it/i }));
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Mini play" }),
    );
  });

  it("falls back to the status line when its surface has no play button", () => {
    const player = createStudioPlayerValue({
      currentItem: warned,
      pendingWarning: warned,
    });
    renderWithPlayer(<StudioWarningGate />, { player });
    fireEvent.click(screen.getByRole("button", { name: /skip/i }));
    expect(document.activeElement).toBe(screen.getByRole("status"));
  });
});
