import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  useStudioPlayer,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { useStudioRadio } from "./useStudioRadio";

const radioControl = vi.hoisted(() => ({
  isEmpty: false,
  shouldHideExplicit: false,
}));
vi.mock("./api/studioDemoDiscovery", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoDiscovery")>();
  return {
    ...original,
    demoStudioRadio: (
      filter: Parameters<typeof original.demoStudioRadio>[0],
    ) =>
      radioControl.isEmpty ? { items: [] } : original.demoStudioRadio(filter),
  };
});
vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => radioControl.shouldHideExplicit,
}));

afterEach(() => {
  radioControl.isEmpty = false;
  radioControl.shouldHideExplicit = false;
});

/** The current track, then the rest of the radio, in play order. */
const playOrder = (player: StudioPlayerValue) =>
  [player.queue.current, ...player.queue.upcomingSourceItems].flatMap(
    (entry) => (entry ? [entry.trackId] : []),
  );

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

function renderRadio() {
  return renderHook(
    () => ({ radio: useStudioRadio(), player: useStudioPlayer() }),
    { wrapper },
  );
}

describe("useStudioRadio (demo)", () => {
  it("hands the player the whole list, shuffled, with its filter", async () => {
    const { result } = renderRadio();
    await act(() =>
      result.current.radio.startRadio({ kind: "genre", value: "fado" }),
    );
    await waitFor(() =>
      expect(result.current.player.radio?.filter).toEqual({
        kind: "genre",
        value: "fado",
      }),
    );
    expect(result.current.player.radio?.pool).toHaveLength(17);
    expect(new Set(playOrder(result.current.player)).size).toBe(17);
    expect(result.current.player.queue.source).toMatchObject({
      kind: "radio",
      radioFilter: { kind: "genre", value: "fado" },
    });
    expect(result.current.radio.startingFilterKey).toBeNull();
  });

  it("leaves explicit tracks out when the member hides them", async () => {
    radioControl.shouldHideExplicit = true;
    const { result } = renderRadio();
    await act(() =>
      result.current.radio.startRadio({ kind: "genre", value: "fado" }),
    );
    // The demo's fado holds one explicit track ("A Beja").
    await waitFor(() =>
      expect(result.current.player.radio?.pool).toHaveLength(16),
    );
  });

  it("ends a one-track mood radio with that track", async () => {
    const { result } = renderRadio();
    await act(() =>
      result.current.radio.startRadio({ kind: "mood", value: "sweaty" }),
    );
    await waitFor(() =>
      expect(playOrder(result.current.player)).toEqual([
        "demo-track-home-2-01",
      ]),
    );
    expect(result.current.player.hasNext).toBe(false);
  });

  it("says so when a radio has nothing to play", async () => {
    radioControl.isEmpty = true;
    const { result } = renderRadio();
    await act(() =>
      result.current.radio.startRadio({ kind: "mood", value: "calm" }),
    );
    expect(result.current.radio.errorKey).toBe("studio:radio.empty");
    expect(result.current.player.radio).toBeNull();
  });
});
