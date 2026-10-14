import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { StudioChaptersEditor } from "./StudioChaptersEditor";
import type { ChapterDraft } from "./studioTracklist";

const row = (id: string, time: string, title: string): ChapterDraft => ({
  id,
  time,
  title,
  artist: "",
});

function Harness({
  initialRows = [row("a", "0:00", "Opening"), row("b", "2:00", "Middle")],
  hasAudio = true,
  isInitiallyOpen = true,
  isShowingAllErrors = false,
  onChange = vi.fn<(rows: ChapterDraft[]) => void>(),
}: {
  initialRows?: ChapterDraft[];
  hasAudio?: boolean;
  isInitiallyOpen?: boolean;
  isShowingAllErrors?: boolean;
  onChange?: (rows: ChapterDraft[]) => void;
}) {
  const [rows, setRows] = useState(initialRows);
  return (
    <StudioChaptersEditor
      rows={rows}
      onChange={(next) => {
        setRows(next);
        onChange(next);
      }}
      durationSeconds={600}
      hasAudio={hasAudio}
      isInitiallyOpen={isInitiallyOpen}
      isShowingAllErrors={isShowingAllErrors}
    />
  );
}

const renderEditor = (props: Parameters<typeof Harness>[0] = {}) =>
  render(
    <TestProviders>
      <Harness {...props} />
    </TestProviders>,
  );

describe("StudioChaptersEditor", () => {
  it("opens a collapsed editor when all errors become visible", async () => {
    const view = renderEditor({ isInitiallyOpen: false });
    const toggle = await screen.findByRole("button", { name: /Chapters/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    view.rerender(
      <TestProviders>
        <Harness isInitiallyOpen={false} isShowingAllErrors />
      </TestProviders>,
    );
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opens by default for a mix and starts closed otherwise", async () => {
    renderEditor({ isInitiallyOpen: false });
    const toggle = await screen.findByRole("button", { name: /Chapters/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("textbox", { name: "Title for chapter 1" }),
    ).toBeNull();
    fireEvent.click(toggle);
    expect(
      await screen.findByRole("textbox", { name: "Title for chapter 1" }),
    ).toHaveValue("Opening");
  });

  it("asks for audio before chapters", async () => {
    renderEditor({ hasAudio: false });
    expect(
      await screen.findByText("Add chapters once this track's audio is ready"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add a chapter" })).toBeNull();
  });

  it("adds, moves and removes rows", async () => {
    const onChange = vi.fn<(rows: ChapterDraft[]) => void>();
    renderEditor({ onChange });
    fireEvent.click(
      await screen.findByRole("button", { name: "Add a chapter" }),
    );
    expect(onChange.mock.lastCall?.[0]).toHaveLength(3);
    fireEvent.click(
      screen.getByRole("button", { name: "Move chapter 1 down" }),
    );
    expect(
      onChange.mock.lastCall?.[0].map((chapter: ChapterDraft) => chapter.title),
    ).toEqual(["Middle", "Opening", ""]);
    fireEvent.click(screen.getByRole("button", { name: "Remove chapter 3" }));
    expect(onChange.mock.lastCall?.[0]).toHaveLength(2);
  });

  it("shows a row's errors once a field is left", async () => {
    renderEditor();
    const time = await screen.findByRole("textbox", {
      name: "Start time for chapter 2",
    });
    fireEvent.change(time, { target: { value: "12:00" } });
    expect(
      screen.queryByText("Start before the track ends at 10:00"),
    ).toBeNull();
    fireEvent.blur(time);
    expect(
      await screen.findByText("Start before the track ends at 10:00"),
    ).toBeInTheDocument();
    expect(time).toHaveAttribute("aria-invalid", "true");
  });

  it("shows every error after a failed save", async () => {
    renderEditor({
      initialRows: [row("a", "0:30", "Late start")],
      isShowingAllErrors: true,
    });
    expect(
      await screen.findByText("The first chapter starts at 0:00"),
    ).toBeInTheDocument();
  });

  it("replaces the rows from a pasted tracklist and lists what it could not read", async () => {
    const onChange = vi.fn<(rows: ChapterDraft[]) => void>();
    renderEditor({ onChange });
    fireEvent.click(
      await screen.findByRole("button", { name: "Paste a tracklist" }),
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Tracklist, one line per chapter" }),
      {
        target: { value: "00:00 Linn - Opening\nbad line\n4:10 Close" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Use this tracklist" }));
    expect(
      onChange.mock.lastCall?.[0].map((chapter: ChapterDraft) => [
        chapter.time,
        chapter.title,
        chapter.artist,
      ]),
    ).toEqual([
      ["0:00", "Opening", "Linn"],
      ["4:10", "Close", ""],
    ]);
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Line 2: bad line")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("2 chapters added")).toBeInTheDocument(),
    );
  });

  it("moves focus to the new row's time input after Add", async () => {
    renderEditor();
    fireEvent.click(
      await screen.findByRole("button", { name: "Add a chapter" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Start time for chapter 3" }),
      ).toHaveFocus(),
    );
  });

  it("keeps focus on a moved row's Move button", async () => {
    renderEditor();
    fireEvent.click(
      await screen.findByRole("button", { name: "Move chapter 1 down" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Move chapter 2 down" }),
      ).toHaveFocus(),
    );
  });

  it("hands focus to the neighbour after Remove and to Add after removing the only row", async () => {
    renderEditor({
      initialRows: [row("a", "0:00", "Opening"), row("b", "2:00", "Middle")],
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Remove chapter 1" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Remove chapter 1" }),
      ).toHaveFocus(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove chapter 1" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Add a chapter" }),
      ).toHaveFocus(),
    );
  });

  it("leaves focus on the paste toggle after a clean paste", async () => {
    renderEditor();
    const toggle = await screen.findByRole("button", {
      name: "Paste a tracklist",
    });
    fireEvent.click(toggle);
    fireEvent.change(
      screen.getByRole("textbox", { name: "Tracklist, one line per chapter" }),
      {
        target: { value: "0:00 Opening" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Use this tracklist" }));
    await waitFor(() => expect(toggle).toHaveFocus());
    expect(document.body).not.toHaveFocus();
  });

  it("shows an untouched invalid row's error only once every error is shown", async () => {
    const rows = [row("a", "0:30", "Late start")];
    const view = render(
      <TestProviders>
        <Harness initialRows={rows} />
      </TestProviders>,
    );
    await screen.findByRole("textbox", { name: "Start time for chapter 1" });
    expect(screen.queryByText("The first chapter starts at 0:00")).toBeNull();
    view.rerender(
      <TestProviders>
        <Harness initialRows={rows} isShowingAllErrors />
      </TestProviders>,
    );
    expect(
      await screen.findByText("The first chapter starts at 0:00"),
    ).toBeInTheDocument();
  });

  it("does not show the title error after leaving the time field", async () => {
    renderEditor({ initialRows: [row("a", "0:00", "")] });
    const time = await screen.findByRole("textbox", {
      name: "Start time for chapter 1",
    });
    fireEvent.blur(time);
    expect(
      screen.queryByRole("textbox", { name: "Title for chapter 1" }),
    ).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText(/title/i, { selector: "p" })).toBeNull();
  });
});
