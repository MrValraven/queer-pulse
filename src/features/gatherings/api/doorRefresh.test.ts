import { QueryClient } from "@tanstack/react-query";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { DOOR_LINGER_MS } from "../checkin/checkinLinger";
import {
  checkInMutationKey,
  refreshDoorsAfterReconnect,
  scheduleDoorRefresh,
} from "./doorRefresh";

const SLUG = "rooftop-supper";

describe("door refresh scheduler", () => {
  let queryClient: QueryClient;
  let invalidateSpy: MockInstance<QueryClient["invalidateQueries"]>;

  beforeEach(() => {
    vi.useFakeTimers();
    queryClient = new QueryClient();
    invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  });

  afterEach(() => {
    // Drains any timer a test left armed, so the module's pending map is clean.
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("invalidates the roster key, which prefixes the door groups, after the linger", () => {
    scheduleDoorRefresh(queryClient, SLUG);
    expect(invalidateSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["attendees", SLUG, false],
    });
  });

  it("folds a settle-path request into the pending frame refresh", () => {
    scheduleDoorRefresh(queryClient, SLUG);
    vi.advanceTimersByTime(DOOR_LINGER_MS / 2);
    scheduleDoorRefresh(queryClient, SLUG);
    vi.advanceTimersByTime(DOOR_LINGER_MS * 3);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it("keeps separate timers for separate gatherings", () => {
    scheduleDoorRefresh(queryClient, SLUG);
    scheduleDoorRefresh(queryClient, "other-night");
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });

  it("re-arms every linger while a tap hangs, then refreshes once", () => {
    const isMutatingSpy = vi
      .spyOn(queryClient, "isMutating")
      .mockReturnValue(1);
    scheduleDoorRefresh(queryClient, SLUG);
    vi.advanceTimersByTime(DOOR_LINGER_MS * 5);
    expect(isMutatingSpy).toHaveBeenCalledTimes(5);
    expect(invalidateSpy).not.toHaveBeenCalled();
    isMutatingSpy.mockReturnValue(0);
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it("schedules again after a refresh has run", () => {
    scheduleDoorRefresh(queryClient, SLUG);
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    scheduleDoorRefresh(queryClient, SLUG);
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });

  it("uses the same mutation key the check-in hooks register", () => {
    expect(checkInMutationKey(SLUG)).toEqual(["check-in", SLUG]);
  });
});

describe("refreshDoorsAfterReconnect", () => {
  let queryClient: QueryClient;
  let invalidateSpy: MockInstance<QueryClient["invalidateQueries"]>;

  beforeEach(() => {
    vi.useFakeTimers();
    queryClient = new QueryClient();
    invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("refreshes only gatherings that have a cached door group query", () => {
    queryClient.setQueryData(["attendees", SLUG, false, "pages", "going"], {});
    // A member-facing guest list holds only the roster key.
    queryClient.setQueryData(["attendees", "members-only", false], {});
    // A demo-mode door never reaches the server.
    queryClient.setQueryData(
      ["attendees", "demo-night", true, "pages", "x"],
      {},
    );
    refreshDoorsAfterReconnect(queryClient);
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["attendees", SLUG, false],
    });
  });

  it("refreshes a slug once however many group queries it has", () => {
    queryClient.setQueryData(["attendees", SLUG, false, "pages", "going"], {});
    queryClient.setQueryData(
      ["attendees", SLUG, false, "pages", "waitlist"],
      {},
    );
    refreshDoorsAfterReconnect(queryClient);
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });

  it("holds a slug with a tap in flight until it settles", () => {
    queryClient.setQueryData(["attendees", SLUG, false, "pages", "going"], {});
    const isMutatingSpy = vi
      .spyOn(queryClient, "isMutating")
      .mockReturnValue(1);
    refreshDoorsAfterReconnect(queryClient);
    vi.advanceTimersByTime(DOOR_LINGER_MS * 2);
    expect(invalidateSpy).not.toHaveBeenCalled();
    isMutatingSpy.mockReturnValue(0);
    vi.advanceTimersByTime(DOOR_LINGER_MS);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
  });
});
