import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { AttendeeRow } from "../api/events.adapters";
import { CheckinScanner } from "./CheckinScanner";

let emitToken: (token: string) => void = () => undefined;
vi.mock("./useCameraScan", () => ({
  useCameraScan: (_isEnabled: boolean, onToken: (token: string) => void) => {
    emitToken = onToken;
    return { videoRef: { current: null }, state: "scanning" };
  },
}));

const nuno = {
  id: "att-nuno",
  slug: "nuno",
  name: "Nuno Menezes",
  initials: "NM",
  background: "",
  color: "",
  checkedInAt: new Date(),
} as AttendeeRow;

describe("CheckinScanner", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("stays open, welcomes the guest, then gets ready for the next card", async () => {
    const onCardToken = vi
      .fn()
      .mockResolvedValue({ kind: "welcome", attendee: nuno });
    const onClose = vi.fn();
    render(
      <CheckinScanner
        onCardToken={onCardToken}
        onUndo={vi.fn()}
        onClose={onClose}
      />,
      { wrapper: TestProviders },
    );
    await act(async () => emitToken("card-1"));
    expect(
      await screen.findByText("Welcome, Nuno Menezes"),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    // Relies on TestProviders having no MotionProvider, so the exit animation
    // does not hold the card in the DOM.
    await act(async () => vi.advanceTimersByTime(2_600));
    expect(screen.queryByText("Welcome, Nuno Menezes")).not.toBeInTheDocument();
  });

  it("reads one card held still only once", async () => {
    const onCardToken = vi
      .fn()
      .mockResolvedValue({ kind: "welcome", attendee: nuno });
    render(
      <CheckinScanner
        onCardToken={onCardToken}
        onUndo={vi.fn()}
        onClose={vi.fn()}
      />,
      { wrapper: TestProviders },
    );
    await act(async () => {
      emitToken("card-1");
      emitToken("card-1");
      emitToken("card-1");
    });
    expect(onCardToken).toHaveBeenCalledTimes(1);
  });

  it("shows an already-arrived guest in its own words", async () => {
    const onCardToken = vi
      .fn()
      .mockResolvedValue({ kind: "repeat", attendee: nuno });
    render(
      <CheckinScanner
        onCardToken={onCardToken}
        onUndo={vi.fn()}
        onClose={vi.fn()}
      />,
      { wrapper: TestProviders },
    );
    await act(async () => emitToken("card-1"));
    expect(
      await screen.findByText(/Nuno Menezes arrived at/),
    ).toBeInTheDocument();
  });

  it("closes itself when the door has closed", async () => {
    const onClose = vi.fn();
    const onCardToken = vi.fn().mockResolvedValue({ kind: "closed" });
    render(
      <CheckinScanner
        onCardToken={onCardToken}
        onUndo={vi.fn()}
        onClose={onClose}
      />,
      { wrapper: TestProviders },
    );
    await act(async () => emitToken("card-1"));
    expect(onClose).toHaveBeenCalled();
  });

  it("undoes from the welcome card", async () => {
    const onUndo = vi.fn();
    const onCardToken = vi
      .fn()
      .mockResolvedValue({ kind: "welcome", attendee: nuno });
    render(
      <CheckinScanner
        onCardToken={onCardToken}
        onUndo={onUndo}
        onClose={vi.fn()}
      />,
      { wrapper: TestProviders },
    );
    await act(async () => emitToken("card-1"));
    fireEvent.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledWith("nuno");
  });
});
