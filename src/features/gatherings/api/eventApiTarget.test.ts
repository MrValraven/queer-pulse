import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

type ClientMock = Mock<(...args: unknown[]) => Promise<unknown>>;

const mocks: {
  apiGet: ClientMock;
  apiGetText: ClientMock;
  apiPost: ClientMock;
  apiPatch: ClientMock;
  apiPut: ClientMock;
  apiDelete: ClientMock;
} = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiGetText: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("../../../shared/api/client", () => ({
  apiGet: mocks.apiGet,
  apiGetText: mocks.apiGetText,
  apiPost: mocks.apiPost,
  apiPatch: mocks.apiPatch,
  apiPut: mocks.apiPut,
  apiDelete: mocks.apiDelete,
  ApiError: class ApiError extends Error {},
}));

import {
  checkInAttendee,
  createEvent,
  getAttendeesCsv,
  getEvent,
  removeFromLineup,
  updateEvent,
  type CreateEventDto,
} from "./events.api";
import {
  approveInviteRequest,
  declineInviteRequest,
} from "./memberInvites.api";
import { eventKeys } from "./eventKeys";
import { getGoTogetherHostConfig } from "../../goTogether/api/goTogether.api";
import { goTogetherKeys } from "../../goTogether/api/goTogetherKeys";

const MUSIC_BASE = "/admin/music-events/club-night-x1";

describe("event API target", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const clientMock of Object.values(mocks)) {
      clientMock.mockResolvedValue(undefined);
    }
  });

  it("keeps every member path byte-identical", async () => {
    const dto = { title: "Brunch" } as unknown as CreateEventDto;
    await getEvent("brunch-ab12");
    expect(mocks.apiGet).toHaveBeenCalledWith("/events/brunch-ab12");
    await createEvent(dto);
    expect(mocks.apiPost).toHaveBeenCalledWith("/events", dto);
    expect(mocks.apiPost.mock.calls[0]?.[1]).toBe(dto);
    mocks.apiPost.mockClear();
    await approveInviteRequest("inv-1");
    expect(mocks.apiPost).toHaveBeenCalledWith("/event-invites/inv-1/approve");
    await getGoTogetherHostConfig("brunch-ab12");
    expect(mocks.apiGet).toHaveBeenCalledWith(
      "/events/brunch-ab12/go-together/config",
    );
  });

  it("refuses to answer an admin invite request without the event slug", () => {
    expect(() => approveInviteRequest("inv-1", "musicAdmin")).toThrow(
      /needs the event slug/,
    );
    expect(() => declineInviteRequest("inv-1", "musicAdmin")).toThrow(
      /needs the event slug/,
    );
    expect(mocks.apiPost).not.toHaveBeenCalled();
  });

  it("points every organizer call at admin/music-events", async () => {
    await getEvent("club-night-x1", undefined, "musicAdmin");
    expect(mocks.apiGet).toHaveBeenCalledWith(MUSIC_BASE);
    await removeFromLineup("club-night-x1", "dj-ana", "musicAdmin");
    expect(mocks.apiDelete).toHaveBeenCalledWith(`${MUSIC_BASE}/lineup/dj-ana`);
    await getAttendeesCsv("club-night-x1", "musicAdmin");
    expect(mocks.apiGetText).toHaveBeenCalledWith(
      `${MUSIC_BASE}/attendees.csv`,
    );
    await approveInviteRequest("inv-1", "musicAdmin", "club-night-x1");
    expect(mocks.apiPost).toHaveBeenCalledWith(
      `${MUSIC_BASE}/invite-requests/inv-1/approve`,
    );
    await declineInviteRequest("inv-1", "musicAdmin", "club-night-x1");
    expect(mocks.apiPost).toHaveBeenCalledWith(
      `${MUSIC_BASE}/invite-requests/inv-1/decline`,
    );
    await checkInAttendee("club-night-x1", { memberSlug: "ana" }, "musicAdmin");
    expect(mocks.apiPost).toHaveBeenCalledWith(`${MUSIC_BASE}/check-ins`, {
      memberSlug: "ana",
    });
  });

  it("sends a house create without communitySlug or runByListingId", async () => {
    const dto = {
      title: "Club night",
      communitySlug: "some-community",
      runByListingId: "listing-1",
    } as unknown as CreateEventDto;
    await createEvent(dto, "musicAdmin");
    const [path, body] = mocks.apiPost.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(path).toBe("/admin/music-events");
    expect(Object.hasOwn(body, "communitySlug")).toBe(false);
    expect(Object.hasOwn(body, "runByListingId")).toBe(false);
    expect(body.gatheringFamily).toBe("music");
  });

  it("drops null communitySlug from a house edit", async () => {
    await updateEvent(
      "s",
      { communitySlug: null, title: "t" },
      undefined,
      "musicAdmin",
    );
    const [path, body] = mocks.apiPatch.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(path).toBe("/admin/music-events/s");
    expect(Object.hasOwn(body, "communitySlug")).toBe(false);
    expect(body.title).toBe("t");
  });

  it("scopes admin keys and leaves member keys as they were", () => {
    expect(eventKeys.detail("s", false)).toEqual(["event", "s", false]);
    expect(eventKeys.detail("s", false, "musicAdmin")).toEqual([
      "event",
      "s",
      false,
      "musicAdmin",
    ]);
    expect(eventKeys.attendees("s", true)).toEqual(["attendees", "s", true]);
    expect(eventKeys.attendees("s", true, "musicAdmin")).toEqual([
      "attendees",
      "s",
      true,
      "musicAdmin",
    ]);
    expect(eventKeys.lineup("s", false, "member")).toEqual([
      "event-lineup",
      "s",
      false,
    ]);
    expect(eventKeys.lineup("s", false, "musicAdmin")).toEqual([
      "event-lineup",
      "s",
      false,
      "musicAdmin",
    ]);
    expect(eventKeys.inviteRequests("s", false)).toEqual([
      "event-invite-requests",
      "s",
      false,
    ]);
    expect(eventKeys.inviteRequests("s", false, "musicAdmin")).toEqual([
      "event-invite-requests",
      "s",
      false,
      "musicAdmin",
    ]);
    expect(goTogetherKeys.hostConfig("s", false)).toEqual([
      "go-together-host-config",
      "s",
      false,
    ]);
    expect(goTogetherKeys.hostConfig("s", false, "musicAdmin")).toEqual([
      "go-together-host-config",
      "s",
      false,
      "musicAdmin",
    ]);
  });
});
