import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { GatheringBookmarkButton } from "./GatheringBookmarkButton";

/**
 * Event Save/Saved toggle (audit BE-3). The button flips its pressed state
 * optimistically and calls the bookmark mutation with the next state (`true` to
 * bookmark, `false` to unbookmark); on failure it rolls the pressed state back.
 * `useToggleEventBookmark` is mocked so we drive success/error without a network
 * — the real hook's optimistic cache patch + persistence is covered separately.
 */

const { mutate, hookState } = vi.hoisted(() => ({
  mutate: vi.fn(),
  hookState: { isPending: false },
}));

vi.mock("./api/useEventMutations", () => ({
  useToggleEventBookmark: () => ({ mutate, isPending: hookState.isPending }),
}));

afterEach(() => {
  mutate.mockReset();
  hookState.isPending = false;
});

function renderButton(bookmarked: boolean) {
  render(
    <TestProviders>
      <GatheringBookmarkButton slug="pride-picnic" param="pride-picnic" bookmarked={bookmarked} />
    </TestProviders>,
  );
}

describe("GatheringBookmarkButton", () => {
  it("optimistically flips to Saved and bookmarks (next=true) on tap", async () => {
    mutate.mockImplementation((_next, opts) => opts?.onSuccess?.());
    renderButton(false);

    const button = await screen.findByRole("button", { name: "Save this event" });
    expect(button).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(button);

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]?.[0]).toBe(true);
    // Pressed state flips immediately, before/independent of any server round-trip.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Saved. Remove from your events" }),
      ).toHaveAttribute("aria-pressed", "true"),
    );
  });

  it("unbookmarks (next=false) when already saved", async () => {
    mutate.mockImplementation((_next, opts) => opts?.onSuccess?.());
    renderButton(true);

    const button = await screen.findByRole("button", {
      name: "Saved. Remove from your events",
    });
    fireEvent.click(button);

    expect(mutate.mock.calls[0]?.[0]).toBe(false);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save this event" }),
      ).toHaveAttribute("aria-pressed", "false"),
    );
  });

  it("rolls the pressed state back when the mutation fails", async () => {
    mutate.mockImplementation((_next, opts) => opts?.onError?.(new Error("boom")));
    renderButton(false);

    const button = await screen.findByRole("button", { name: "Save this event" });
    fireEvent.click(button);

    // Flipped optimistically then reverted by onError → back to unsaved.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save this event" }),
      ).toHaveAttribute("aria-pressed", "false"),
    );
  });
});
