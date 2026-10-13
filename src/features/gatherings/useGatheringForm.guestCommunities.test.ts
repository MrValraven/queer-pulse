import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import { reviewGuestCommunitiesText } from "./reviewRecapReadings";
import { useGatheringForm } from "./useGatheringForm";

const t: TFunction = (key, options) =>
  `${key} ${JSON.stringify(options ?? {})}`;

const transHub: GuestCommunityDraftEntry = {
  slug: "trans-hub",
  name: "Trans & Non-Binary Hub",
  accessTier: "request",
  status: "unsent",
};
const rainbowArts: GuestCommunityDraftEntry = {
  slug: "rainbow-arts",
  name: "Rainbow Arts Collective",
  accessTier: "request",
  status: "unsent",
};

function formWithGuests() {
  const rendered = renderHook(() => useGatheringForm());
  act(() => rendered.result.current.setCommunitySlug("queer-runners"));
  act(() =>
    rendered.result.current.setGuestCommunities([transHub, rainbowArts]),
  );
  return rendered;
}

describe("the wizard's guest communities", () => {
  it("drops a guest that becomes the lead", () => {
    const { result } = formWithGuests();
    act(() => result.current.setCommunitySlug("trans-hub"));
    expect(result.current.guestCommunities).toEqual([rainbowArts]);
  });

  it("drops every pick when the lead is cleared, since none went out", () => {
    const { result } = formWithGuests();
    act(() => result.current.setCommunitySlug(""));
    expect(result.current.guestCommunities).toEqual([]);
  });

  it("counts a picked guest as an edit worth keeping", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(result.current.dirty).toBe(false);
    act(() => result.current.setGuestCommunities([transHub]));
    expect(result.current.dirty).toBe(true);
  });

  it("reads the guests back on the review step with when they go out", () => {
    const { result } = formWithGuests();
    expect(reviewGuestCommunitiesText(result.current, t)).toBe(
      `gatherings:guestCommunities.reviewValue {"names":"Trans & Non-Binary Hub, Rainbow Arts Collective"}`,
    );
  });

  it("reads nothing on the review step without a lead", () => {
    const { result } = renderHook(() => useGatheringForm());
    expect(reviewGuestCommunitiesText(result.current, t)).toBe("");
  });
});
