import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ApiError } from "../../shared/api/client";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
  type LineupPickStepProps,
} from "./eventHostScope";
import { GatheringLineupEditor } from "./GatheringLineupEditor";

const mocks: { inviteRejectWith: Error | null } = vi.hoisted(() => ({
  inviteRejectWith: null,
}));

vi.mock("./api/useEventLineup", () => ({
  useEventLineup: () => ({ data: { entries: [], viewerEntry: null } }),
  useInviteToLineup: () => ({
    mutateAsync: () =>
      mocks.inviteRejectWith
        ? Promise.reject(mocks.inviteRejectWith)
        : Promise.resolve(undefined),
  }),
  useChangeLineupRole: () => ({ mutateAsync: () => Promise.resolve() }),
  useRemoveFromLineup: () => ({ mutateAsync: () => Promise.resolve() }),
}));

vi.mock("./api/useAttendees", () => ({
  useAttendees: () => ({ data: undefined }),
}));

function StudioPickStub({ onPick }: LineupPickStepProps) {
  return (
    <button
      type="button"
      onClick={() => onPick({ slug: "nova", name: "Nova Reyes" })}
    >
      Studio artist stub
    </button>
  );
}

const houseScope: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  isHouseEvent: true,
  LineupPickStep: StudioPickStub,
};

const renderEditor = () =>
  render(
    <TestProviders>
      <EventHostScopeContext.Provider value={houseScope}>
        <GatheringLineupEditor slug="house-night" />
      </EventHostScopeContext.Provider>
    </TestProviders>,
  );

describe("GatheringLineupEditor in the house scope", () => {
  // Reset here so a failed assertion never leaks the refusal into the next test.
  afterEach(() => {
    mocks.inviteRejectWith = null;
  });

  it("books through the Studio artist picker in the house scope", async () => {
    renderEditor();
    fireEvent.click(
      await screen.findByRole("button", { name: /Invite to lineup/ }),
    );
    expect(
      await screen.findByRole("button", { name: "Studio artist stub" }),
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Search people")).toBeNull();
  });

  it("names an unbookable performer", async () => {
    mocks.inviteRejectWith = new ApiError(400, "Bad request", {
      statusCode: 400,
      code: "music_event_performer_not_studio_artist",
    });
    renderEditor();
    fireEvent.click(
      await screen.findByRole("button", { name: /Invite to lineup/ }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Studio artist stub" }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Send invite" }));
    expect(
      await screen.findByText("Only Studio artists can be booked"),
    ).toBeInTheDocument();
  });
});
