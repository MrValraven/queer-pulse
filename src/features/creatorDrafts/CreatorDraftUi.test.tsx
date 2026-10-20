import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import { TestProviders } from "../../test/TestProviders";
import { CreatorDraftConflictStrip } from "./CreatorDraftConflictStrip";
import { CreatorDraftNotice } from "./CreatorDraftNotice";
import { CreatorDraftSaveLine } from "./CreatorDraftSaveLine";
import { creatorDraftSaveStatusText } from "./creatorDraftSaveStatusText";

describe("creator draft UI", () => {
  const keyEcho: TFunction = (key, options) =>
    options?.count === undefined ? key : `${key}:${String(options.count)}`;

  it("words every save status", () => {
    const now = Date.parse("2026-10-19T10:30:00.000Z");
    expect(
      creatorDraftSaveStatusText({ kind: "idle" }, now, keyEcho),
    ).toBeNull();
    expect(creatorDraftSaveStatusText({ kind: "saving" }, now, keyEcho)).toBe(
      "shared:creatorDraft.status.saving",
    );
    expect(
      creatorDraftSaveStatusText(
        { kind: "saved", savedAt: "2026-10-19T10:29:40.000Z" },
        now,
        keyEcho,
      ),
    ).toBe("shared:creatorDraft.status.savedJustNow");
    expect(
      creatorDraftSaveStatusText(
        { kind: "saved", savedAt: "2026-10-19T10:18:00.000Z" },
        now,
        keyEcho,
      ),
    ).toBe("shared:creatorDraft.status.savedMinutes:12");
    expect(
      creatorDraftSaveStatusText(
        { kind: "saved", savedAt: "2026-10-19T07:00:00.000Z" },
        now,
        keyEcho,
      ),
    ).toBe("shared:creatorDraft.status.savedHours:3");
    expect(
      creatorDraftSaveStatusText(
        { kind: "saved", savedAt: "2026-10-17T10:00:00.000Z" },
        now,
        keyEcho,
      ),
    ).toBe("shared:creatorDraft.status.savedDays:2");
    expect(creatorDraftSaveStatusText({ kind: "retrying" }, now, keyEcho)).toBe(
      "shared:creatorDraft.status.retrying",
    );
    expect(creatorDraftSaveStatusText({ kind: "tooLarge" }, now, keyEcho)).toBe(
      "shared:creatorDraft.status.tooLarge",
    );
    expect(creatorDraftSaveStatusText({ kind: "notSaved" }, now, keyEcho)).toBe(
      "shared:creatorDraft.status.notSaved",
    );
    expect(creatorDraftSaveStatusText({ kind: "conflict" }, now, keyEcho)).toBe(
      "shared:creatorDraft.status.conflict",
    );
  });

  it("renders the note with its key and folds it away", async () => {
    const { rerender } = render(
      <TestProviders>
        <CreatorDraftNotice messageKey="gatherings:creatorDraftNote.body" />
      </TestProviders>,
    );
    expect(
      screen.getByText(/creatorDraftNote\.body|Our team/),
    ).toBeInTheDocument();
    rerender(
      <TestProviders>
        <CreatorDraftNotice
          messageKey="gatherings:creatorDraftNote.body"
          isShown={false}
        />
      </TestProviders>,
    );
    await waitFor(() =>
      expect(screen.queryByText(/creatorDraftNote\.body|Our team/)).toBeNull(),
    );
  });

  it("offers both conflict choices and calls their handlers", async () => {
    const onLoadNewer = vi.fn();
    const onKeepThisVersion = vi.fn();
    render(
      <TestProviders>
        <CreatorDraftConflictStrip
          isOpen
          isBusy={false}
          onLoadNewer={onLoadNewer}
          onKeepThisVersion={onKeepThisVersion}
        />
      </TestProviders>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: /loadNewer|Load the newer draft/ }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /keepThisVersion|Keep this version/ }),
    );
    expect(onLoadNewer).toHaveBeenCalledTimes(1);
    expect(onKeepThisVersion).toHaveBeenCalledTimes(1);
  });

  it("offers only Keep this version when the server draft is gone", async () => {
    render(
      <TestProviders>
        <CreatorDraftConflictStrip
          isOpen
          isBusy={false}
          isServerDraftGone
          onLoadNewer={vi.fn()}
          onKeepThisVersion={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      screen.getByText(/conflict\.goneTitle|closed somewhere else/),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", {
          name: /loadNewer|Load the newer draft/,
        }),
      ).toBeNull(),
    );
    expect(
      screen.getByRole("button", { name: /keepThisVersion|Keep this version/ }),
    ).toBeInTheDocument();
  });

  it("marks busy conflict buttons with aria-disabled and ignores presses", async () => {
    const onLoadNewer = vi.fn();
    const onKeepThisVersion = vi.fn();
    render(
      <TestProviders>
        <CreatorDraftConflictStrip
          isOpen
          isBusy
          onLoadNewer={onLoadNewer}
          onKeepThisVersion={onKeepThisVersion}
        />
      </TestProviders>,
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-disabled", "true");
      await userEvent.click(button);
    }
    expect(onLoadNewer).not.toHaveBeenCalled();
    expect(onKeepThisVersion).not.toHaveBeenCalled();
  });

  it("reads just now for a save that arrives 25 seconds after mount", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(Date.parse("2026-10-19T10:00:00.000Z"));
      const { rerender } = render(
        <TestProviders>
          <CreatorDraftSaveLine status={{ kind: "idle" }} />
        </TestProviders>,
      );
      act(() => {
        vi.setSystemTime(Date.parse("2026-10-19T10:00:25.000Z"));
      });
      rerender(
        <TestProviders>
          <CreatorDraftSaveLine
            status={{ kind: "saved", savedAt: "2026-10-19T10:00:25.000Z" }}
          />
        </TestProviders>,
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        /savedJustNow|Saved just now/,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("announces the save line through a status region", () => {
    render(
      <TestProviders>
        <CreatorDraftSaveLine status={{ kind: "saving" }} />
      </TestProviders>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/saving|Saving/);
  });
});

describe("creator draft conflict strip load feedback", () => {
  const loadFailedText = /conflict\.loadFailed|couldn't load the newer draft/;
  const renderStrip = (isOpen: boolean, isBusy: boolean) => (
    <TestProviders>
      <CreatorDraftConflictStrip
        isOpen={isOpen}
        isBusy={isBusy}
        onLoadNewer={vi.fn()}
        onKeepThisVersion={vi.fn()}
      />
    </TestProviders>
  );

  it("folds in a load failure line when a Load click ends with the strip still open", async () => {
    const { rerender } = render(renderStrip(true, false));
    await userEvent.click(
      screen.getByRole("button", { name: /loadNewer|Load the newer draft/ }),
    );
    rerender(renderStrip(true, true));
    expect(screen.queryByText(loadFailedText)).toBeNull();
    rerender(renderStrip(true, false));
    expect(await screen.findByText(loadFailedText)).toBeInTheDocument();
    // A retry folds the line away while it loads.
    await userEvent.click(
      screen.getByRole("button", { name: /loadNewer|Load the newer draft/ }),
    );
    await waitFor(() => expect(screen.queryByText(loadFailedText)).toBeNull());
  });

  it("shows no load failure line when the newer draft loads and the strip closes", async () => {
    const { rerender } = render(renderStrip(true, false));
    await userEvent.click(
      screen.getByRole("button", { name: /loadNewer|Load the newer draft/ }),
    );
    rerender(renderStrip(true, true));
    rerender(renderStrip(false, false));
    rerender(renderStrip(true, false));
    expect(screen.queryByText(loadFailedText)).toBeNull();
  });
});

describe("creator draft conflict strip focus when it folds", () => {
  const keepName = /keepThisVersion|Keep this version/;
  const loadName = /loadNewer|Load the newer draft/;
  const renderEditor = (
    isOpen: boolean,
    isBusy: boolean,
    hasSaveLine = true,
  ) => (
    <TestProviders>
      <form data-testid="editor">
        <CreatorDraftConflictStrip
          isOpen={isOpen}
          isBusy={isBusy}
          onLoadNewer={vi.fn()}
          onKeepThisVersion={vi.fn()}
        />
        {hasSaveLine && <CreatorDraftSaveLine status={{ kind: "saving" }} />}
      </form>
    </TestProviders>
  );

  it("moves focus to the save line after Keep this version", async () => {
    const { rerender } = render(renderEditor(true, false));
    await userEvent.click(screen.getByRole("button", { name: keepName }));
    rerender(renderEditor(true, true));
    rerender(renderEditor(false, false));
    expect(screen.getByRole("status")).toHaveFocus();
  });

  it("moves focus to the save line after the newer draft loads", async () => {
    const { rerender } = render(renderEditor(true, false));
    await userEvent.click(screen.getByRole("button", { name: loadName }));
    rerender(renderEditor(true, true));
    rerender(renderEditor(false, false));
    expect(screen.getByRole("status")).toHaveFocus();
  });

  it("keeps focus on the Load button when the newer draft does not load", async () => {
    const { rerender } = render(renderEditor(true, false));
    const loadButton = screen.getByRole("button", { name: loadName });
    await userEvent.click(loadButton);
    rerender(renderEditor(true, true));
    rerender(renderEditor(true, false));
    expect(loadButton).toHaveFocus();
  });

  it("does not pull focus on a later fold after a Load that failed", async () => {
    const { rerender } = render(renderEditor(true, false));
    await userEvent.click(screen.getByRole("button", { name: loadName }));
    rerender(renderEditor(true, true));
    rerender(renderEditor(true, false));
    (document.activeElement as HTMLElement).blur();
    expect(document.body).toHaveFocus();
    rerender(renderEditor(false, false));
    expect(document.body).toHaveFocus();
  });

  it("falls back to the strip's own anchor when the editor has no save line", async () => {
    const { rerender } = render(renderEditor(true, false, false));
    await userEvent.click(screen.getByRole("button", { name: keepName }));
    rerender(renderEditor(false, false, false));
    const focused = document.activeElement;
    expect(focused).not.toBe(document.body);
    expect(focused).toHaveAttribute("tabindex", "-1");
    expect(screen.getByTestId("editor")).toContainElement(
      focused as HTMLElement,
    );
  });

  it("leaves focus alone when the strip folds while focus is elsewhere", () => {
    const { rerender } = render(renderEditor(true, false));
    const outside = document.createElement("button");
    document.body.append(outside);
    try {
      outside.focus();
      rerender(renderEditor(false, false));
      expect(outside).toHaveFocus();
    } finally {
      outside.remove();
    }
  });
});
