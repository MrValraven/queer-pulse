import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { StudioLyricTimingDialog } from "./StudioLyricTimingDialog";

const clock = vi.hoisted(() => ({ seconds: 0, isReady: true }));
vi.mock("./useTimingAudio", () => ({
  useTimingAudio: () => ({
    currentTime: 0,
    currentTimeNow: () => clock.seconds,
    isPlaying: false,
    isReady: clock.isReady,
    isSilentClock: false,
    hasError: false,
    play: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
  }),
}));

const SOURCE = { kind: "track" as const, trackId: "t1", durationSeconds: 200 };

function renderDialog(lyricLines: string[], onSave = vi.fn()) {
  render(
    <TestProviders>
      <StudioLyricTimingDialog
        lyricLines={lyricLines}
        initial={null}
        audioSource={SOURCE}
        onSave={onSave}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );
  return onSave;
}

beforeEach(() => {
  clock.seconds = 0;
  clock.isReady = true;
});

describe("StudioLyricTimingDialog", () => {
  it("lists unreadable lines and keeps the readable ones", async () => {
    const onSave = renderDialog([]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "LRC lyrics" }),
      {
        target: {
          value:
            "[1:2]broken\n[ar:Someone]\n[00:01.00]One\n[00:75.00]bad\n[00:04.50]Two",
        },
      },
    );
    expect(within(dialog).getByText("2 lines read")).toBeInTheDocument();
    expect(within(dialog).getByText("Line 1: [1:2]broken")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Line 4: [00:75.00]bad"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Use these timings" }),
    );
    expect(onSave).toHaveBeenCalledWith([
      { ms: 1000, text: "One" },
      { ms: 4500, text: "Two" },
    ]);
  });

  it("times each line with the Stamp button and nudges one later", async () => {
    const onSave = renderDialog(["One", "Two"]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    clock.seconds = 1.5;
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Stamp line 1" }),
    );
    clock.seconds = 4.25;
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Stamp line 2" }),
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Line 1 0.1 seconds later" }),
    );
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Use these timings" }),
    );
    expect(onSave).toHaveBeenCalledWith([
      { ms: 1600, text: "One" },
      { ms: 4250, text: "Two" },
    ]);
  });

  it("stamps on Space outside the controls", async () => {
    renderDialog(["One", "Two"]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    clock.seconds = 2;
    fireEvent.keyDown(within(dialog).getByTestId("tap-along"), { key: " " });
    expect(within(dialog).getByText("00:02.00")).toBeInTheDocument();
  });

  it("refuses to save until every line has a time", async () => {
    const onSave = renderDialog(["One", "Two"]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Stamp line 1" }),
    );
    const save = within(dialog).getByRole("button", {
      name: "Use these timings",
    });
    expect(save).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(save);
    expect(onSave).not.toHaveBeenCalled();
    expect(
      within(dialog).getByText("Time every line to use these timings"),
    ).toBeInTheDocument();
  });

  it("does not stamp on Space while a button has focus", async () => {
    renderDialog(["One", "Two"]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    clock.seconds = 2;
    fireEvent.keyDown(
      within(dialog).getByRole("button", { name: "Stamp line 1" }),
      { key: " " },
    );
    expect(within(dialog).queryByText("00:02.00")).not.toBeInTheDocument();
  });

  it("stamps once while Space is held", async () => {
    renderDialog(["One", "Two"]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    const pane = within(dialog).getByTestId("tap-along");
    clock.seconds = 2;
    fireEvent.keyDown(pane, { key: " " });
    fireEvent.keyDown(pane, { key: " ", repeat: true });
    fireEvent.keyDown(pane, { key: " ", repeat: true });
    expect(within(dialog).getAllByText("00:02.00")).toHaveLength(1);
    expect(within(dialog).getAllByText("No time yet")).toHaveLength(1);
  });

  it("does not stamp while the audio is not ready", async () => {
    clock.isReady = false;
    renderDialog(["One", "Two"]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    const stamp = within(dialog).getByRole("button", { name: "Stamp line 1" });
    expect(stamp).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(stamp);
    fireEvent.keyDown(within(dialog).getByTestId("tap-along"), { key: " " });
    expect(within(dialog).getAllByText("No time yet")).toHaveLength(2);
  });

  it("blocks saving over 500 lines in tap mode", async () => {
    const onSave = renderDialog(
      Array.from({ length: 501 }, (_line, index) => `Line ${index}`),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    expect(
      within(dialog).getByText("Keep it to 500 timed lines"),
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Use these timings" }),
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps the lines-read count out of live announcements", async () => {
    renderDialog([]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    expect(within(dialog).getByText("0 lines read")).not.toHaveAttribute(
      "role",
    );
    expect(within(dialog).queryByRole("status")).not.toBeInTheDocument();
  });

  it("scrolls the preview into view when it opens", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderDialog(["One", "Two"]);
    const dialog = await screen.findByRole("dialog", {
      name: "Time the lyrics",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Preview" }));
    // Not at once: the scroll waits for the preview's Collapse to grow.
    expect(scrollIntoView).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ block: "nearest" }),
      ),
    );
  });
});
