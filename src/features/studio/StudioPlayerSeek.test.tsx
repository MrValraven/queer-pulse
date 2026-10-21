import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioPlayerSeek } from "./StudioPlayerSeek";
import {
  createClock,
  createStudioPlayerValue,
  renderWithPlayer,
} from "./player/ui/studioPlayerTestHarness";
import { PointerEventStub } from "../../test/pointerEventStub";

const TIME_DISPLAY_STORAGE_KEY = "studio.player.timeDisplay";

beforeEach(() => {
  vi.stubGlobal("PointerEvent", PointerEventStub);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 300,
    height: 32,
    top: 0,
    left: 0,
    right: 300,
    bottom: 32,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.localStorage.removeItem(TIME_DISPLAY_STORAGE_KEY);
});

const chapter = (startSeconds: number) => ({
  startSeconds,
  title: `Part at ${startSeconds}`,
  artist: null,
  timeLabel: "0:00",
});

const waveformPlayer = (overrides = {}) =>
  createStudioPlayerValue({
    currentWaveform: Array.from({ length: 200 }, () => 0.5),
    ...overrides,
  });

function seekRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>(
    "[data-studio-range='seek']",
  );
  if (!root) throw new Error("No seek slider root");
  return root;
}

function waitMs(milliseconds: number) {
  return act(
    () => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)),
  );
}

describe("StudioPlayerSeek", () => {
  it("keeps the plain track when the track has no peaks", async () => {
    const onSeek = vi.fn();
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={onSeek} />,
    );
    const slider = await screen.findByRole("slider");
    expect(container.querySelector("svg")).toBeNull();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await waitFor(() => expect(onSeek).toHaveBeenLastCalledWith(25));
  });

  it("draws the waveform as the same slider's visuals", async () => {
    const onSeek = vi.fn();
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={onSeek} />,
      { player: waveformPlayer() },
    );
    const slider = await screen.findByRole("slider");
    await waitFor(() =>
      expect(slider).toHaveAttribute("aria-valuetext", "0:20 of 3:20"),
    );
    expect(container.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    const onWindowKey = vi.fn();
    window.addEventListener("keydown", onWindowKey);
    fireEvent.keyDown(slider, { key: "Home" });
    await waitFor(() => expect(onSeek).toHaveBeenLastCalledWith(0));
    // The harness clock never moves, so the held seek is the next key's base.
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    await waitFor(() => expect(onSeek).toHaveBeenLastCalledWith(5));
    // The slider keeps its keys, so a focused slider seeks once.
    expect(onWindowKey).not.toHaveBeenCalled();
    window.removeEventListener("keydown", onWindowKey);
  });

  it("draws one tick per chapter after the first, on the waveform and the plain track", () => {
    const chapters = [chapter(0), chapter(60), chapter(120)];
    const waveform = renderWithPlayer(<StudioPlayerSeek onSeek={vi.fn()} />, {
      player: waveformPlayer({ currentChapters: chapters }),
    });
    expect(
      waveform.container.querySelectorAll("[data-chapter-tick]"),
    ).toHaveLength(2);
    waveform.unmount();
    const plain = renderWithPlayer(<StudioPlayerSeek onSeek={vi.fn()} />, {
      player: createStudioPlayerValue({ currentChapters: chapters }),
    });
    expect(
      plain.container.querySelectorAll("[data-chapter-tick]"),
    ).toHaveLength(2);
  });

  it("seeks once when a drag ends", async () => {
    const onSeek = vi.fn();
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={onSeek} />,
    );
    const root = seekRoot(container);
    fireEvent.pointerDown(root, { clientX: 150, button: 0 });
    fireEvent.pointerMove(root, { clientX: 180 });
    fireEvent.pointerMove(root, { clientX: 200 });
    await waitMs(32);
    expect(onSeek).not.toHaveBeenCalled();
    fireEvent.pointerUp(root, { clientX: 200 });
    expect(onSeek).toHaveBeenCalledTimes(1);
    expect(onSeek.mock.calls[0]?.[0]).toBeCloseTo(133.33, 1);
  });

  it("drops a drag on Escape and keeps the key to itself", async () => {
    const onSeek = vi.fn();
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={onSeek} />,
    );
    const root = seekRoot(container);
    const slider = screen.getByRole("slider");
    const onWindowKey = vi.fn();
    window.addEventListener("keydown", onWindowKey);
    fireEvent.pointerDown(root, { clientX: 150, button: 0 });
    fireEvent.keyDown(slider, { key: "Escape" });
    fireEvent.pointerUp(root, { clientX: 150 });
    await waitMs(200);
    expect(onSeek).not.toHaveBeenCalled();
    expect(onWindowKey).not.toHaveBeenCalled();
    window.removeEventListener("keydown", onWindowKey);
  });

  it("switches the right label between the length and the time left, and remembers it", async () => {
    const view = renderWithPlayer(<StudioPlayerSeek onSeek={vi.fn()} />);
    const toggle = await screen.findByRole("button", {
      name: "Show time left",
    });
    expect(toggle).toHaveTextContent("3:20");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveTextContent("−3:00");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(window.localStorage.getItem(TIME_DISPLAY_STORAGE_KEY)).toBe(
        JSON.stringify("remaining"),
      ),
    );
    view.unmount();
    renderWithPlayer(<StudioPlayerSeek onSeek={vi.fn()} />);
    expect(
      await screen.findByRole("button", { name: "Show time left" }),
    ).toHaveTextContent("−3:00");
    fireEvent.click(screen.getByRole("button", { name: "Show time left" }));
    expect(
      screen.getByRole("button", { name: "Show time left" }),
    ).toHaveTextContent("3:20");
  });

  it("keeps the time left choice in step across two mounted seek bars", async () => {
    renderWithPlayer(
      <>
        <StudioPlayerSeek onSeek={vi.fn()} />
        <StudioPlayerSeek onSeek={vi.fn()} size="large" />
      </>,
    );
    const toggles = await screen.findAllByRole("button", {
      name: "Show time left",
    });
    const [barToggle, nowPlayingToggle] = toggles;
    if (!barToggle || !nowPlayingToggle)
      throw new Error("Two toggles expected");
    fireEvent.click(barToggle);
    for (const toggle of [barToggle, nowPlayingToggle]) {
      expect(toggle).toHaveTextContent("−3:00");
      expect(toggle).toHaveAttribute("aria-pressed", "true");
    }
    fireEvent.click(nowPlayingToggle);
    for (const toggle of [barToggle, nowPlayingToggle]) {
      expect(toggle).toHaveTextContent("3:20");
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("shows --:-- on both sides and ignores keys while the length is unknown", async () => {
    const onSeek = vi.fn();
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={onSeek} />,
      { clock: createClock({ currentTime: 0, duration: null }) },
    );
    const slider = await screen.findByRole("slider");
    expect(screen.getAllByText("--:--")).toHaveLength(2);
    // The labels reserve what a short track needs, so nothing jumps when the length arrives.
    expect(
      container
        .querySelector<HTMLElement>("[data-size]")
        ?.style.getPropertyValue("--studio-seek-time-chars"),
    ).toBe("5");
    expect(slider).toHaveAttribute("aria-valuetext", "Length not known yet");
    expect(slider).toHaveAttribute("aria-disabled", "true");
    const toggle = screen.getByRole("button", { name: "Show time left" });
    expect(toggle).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "End" });
    await waitMs(200);
    expect(onSeek).not.toHaveBeenCalled();
  });

  it("names the chapter under the mouse in the hover bubble", async () => {
    const { container } = renderWithPlayer(
      <StudioPlayerSeek onSeek={vi.fn()} />,
      {
        player: waveformPlayer({
          currentChapters: [chapter(0), chapter(60), chapter(120)],
        }),
      },
    );
    const root = seekRoot(container);
    fireEvent.pointerEnter(root, { clientX: 150 });
    fireEvent.pointerMove(root, { clientX: 150 });
    await waitFor(() => {
      const bubble = root.querySelector("[data-visible]");
      expect(bubble).toHaveTextContent("Part at 60");
      expect(bubble).toHaveTextContent("1:40");
    });
  });
});
