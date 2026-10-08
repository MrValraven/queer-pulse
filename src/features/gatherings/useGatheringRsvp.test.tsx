import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { useGatheringRsvp } from "./useGatheringRsvp";
import type { GatheringDetail } from "./data";
import { GatheringPreviewContext } from "./guestPreview/gatheringPreviewContext";

/**
 * Design review S4: in demo mode, `useRsvp`/`useUnrsvp` never reach a
 * server, so the confirmed RSVP used to live only in this hook's own
 * `useState`. Returning from the Go together questionnaire remounts the
 * gathering page with the SAME static `gathering.myRsvpStatus` the demo
 * mock always carries (it never changes), so a fresh mount forgot the RSVP
 * and showed "Reserve a seat" again. `demoRsvpStatusBySlug` (module level,
 * the `goTogether.mock.ts` `demoState` pattern) fixes that: these tests use
 * a fresh `<TestProviders>` render per "mount", exactly like a real
 * navigate-away-and-back, and a fresh `GatheringDetail` object each time
 * whose own `myRsvpStatus` stays `null` throughout, so only the module-level
 * mirror can be the source of a persisted status.
 */
function demoGathering(slug: string): GatheringDetail {
  return {
    slug,
    myRsvpStatus: null,
    cancelled: false,
    isFull: false,
    rsvpClosesAt: null,
    viewerIsOrganizer: false,
  } as unknown as GatheringDetail;
}

function renderRsvp(gathering: GatheringDetail) {
  return renderHook(() => useGatheringRsvp(gathering), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestProviders>{children}</TestProviders>
    ),
  });
}

describe("useGatheringRsvp demo persistence", () => {
  it("keeps the RSVP after the hook remounts for the same gathering", () => {
    const firstMount = renderRsvp(demoGathering("s4-remount-going"));
    act(() => firstMount.result.current.goOrWaitlist());
    expect(firstMount.result.current.status).toBe("going");
    firstMount.unmount();

    const secondMount = renderRsvp(demoGathering("s4-remount-going"));
    expect(secondMount.result.current.status).toBe("going");
  });

  it("keeps a cancelled RSVP cancelled after a remount too", () => {
    const firstMount = renderRsvp(demoGathering("s4-remount-cancel"));
    act(() => firstMount.result.current.goOrWaitlist());
    act(() => firstMount.result.current.cancelRsvp());
    expect(firstMount.result.current.status).toBeNull();
    firstMount.unmount();

    const secondMount = renderRsvp(demoGathering("s4-remount-cancel"));
    expect(secondMount.result.current.status).toBeNull();
  });

  it("keeps different gatherings' demo RSVPs independent", () => {
    const goingGathering = renderRsvp(demoGathering("s4-independent-going"));
    act(() => goingGathering.result.current.goOrWaitlist());
    expect(goingGathering.result.current.status).toBe("going");

    const untouchedGathering = renderRsvp(
      demoGathering("s4-independent-untouched"),
    );
    expect(untouchedGathering.result.current.status).toBeNull();
  });
});

describe("useGatheringRsvp in a host's guest preview", () => {
  function renderPreviewRsvp(runGuestAction: () => void) {
    return renderHook(() => useGatheringRsvp(demoGathering("preview-inert")), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestProviders>
          <GatheringPreviewContext.Provider
            value={{ viewAs: "member", runGuestAction }}
          >
            {children}
          </GatheringPreviewContext.Provider>
        </TestProviders>
      ),
    });
  }

  it("answers every RSVP action with the preview action and changes nothing", () => {
    const runGuestAction = vi.fn();
    const { result } = renderPreviewRsvp(runGuestAction);

    act(() => result.current.goOrWaitlist());
    act(() => result.current.markMaybe());
    act(() => result.current.cancelRsvp());

    expect(runGuestAction).toHaveBeenCalledTimes(3);
    expect(result.current.status).toBeNull();
  });
});
