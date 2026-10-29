import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { codedReasonFor } from "../../shared/api/errorHandling";
import { ApiError } from "../../shared/api/client";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import type { CreateEventDto } from "./api/events.api";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "./eventHostScope";
import type { GatheringForm } from "./useGatheringForm";
import { usePublishGathering } from "./usePublishGathering";

const HOUSE_SLUG = "club-night-x1";

const mocks: {
  createEvent: Mock<(dto: unknown, target?: string) => Promise<unknown>>;
  createCohostInvite: Mock<(...args: unknown[]) => Promise<unknown>>;
  inviteGuestCommunity: Mock<(...args: unknown[]) => Promise<unknown>>;
  switchOnGoTogetherForSlugs: Mock<(slugs: string[]) => Promise<boolean>>;
  showToast: Mock<(...args: unknown[]) => void>;
} = vi.hoisted(() => ({
  createEvent: vi.fn<(dto: unknown, target?: string) => Promise<unknown>>(),
  createCohostInvite: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  inviteGuestCommunity: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  switchOnGoTogetherForSlugs: vi.fn<(slugs: string[]) => Promise<boolean>>(),
  showToast: vi.fn<(...args: unknown[]) => void>(),
}));

const HOUSE_PAYLOAD = {
  title: "Club night at the warehouse",
  startAt: "2026-12-05T22:00:00.000Z",
} as unknown as CreateEventDto;

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: () => undefined,
    t: (key: string) => key,
    translateIn: () => undefined,
  }),
}));
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));
vi.mock("./api/events.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/events.api")>()),
  createEvent: (dto: unknown, target?: string) =>
    mocks.createEvent(dto, target),
  createCohostInvite: (...args: unknown[]) => mocks.createCohostInvite(...args),
}));
vi.mock("./api/eventCommunities.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/eventCommunities.api")>()),
  inviteGuestCommunity: (...args: unknown[]) =>
    mocks.inviteGuestCommunity(...args),
}));
// Every date is still open for Go together, so only the scope can hold the
// switch back.
vi.mock("../goTogether/host/goTogetherPublish", () => ({
  goTogetherSlugsToSwitchOn: () => [HOUSE_SLUG],
  switchOnGoTogetherForSlugs: (slugs: string[]) =>
    mocks.switchOnGoTogetherForSlugs(slugs),
}));
vi.mock("./api/events.adapters", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/events.adapters")>()),
  formToCreateEventDto: () => HOUSE_PAYLOAD,
}));

const HOUSE_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
};

const rainbowArts: GuestCommunityDraftEntry = {
  slug: "rainbow-arts",
  name: "Rainbow Arts Collective",
  accessTier: "request",
  status: "unsent",
};

/** A form that would send every member follow-up. */
const formWithFollowUps = {
  cohostSlugs: ["sam-r", "ines-v"],
  goTogetherEnabled: true,
  communitySlug: "queer-runners",
  guestCommunities: [rainbowArts],
} as unknown as GatheringForm;

function houseWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <EventHostScopeContext.Provider value={HOUSE_TEST_SCOPE}>
        {children}
      </EventHostScopeContext.Provider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  mocks.createEvent.mockResolvedValue({
    slug: HOUSE_SLUG,
    occurrenceSlugs: [HOUSE_SLUG],
  });
  mocks.createCohostInvite.mockResolvedValue({});
  mocks.inviteGuestCommunity.mockResolvedValue({});
  mocks.switchOnGoTogetherForSlugs.mockResolvedValue(false);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  mocks.createEvent.mockReset();
  mocks.createCohostInvite.mockReset();
  mocks.inviteGuestCommunity.mockReset();
  mocks.switchOnGoTogetherForSlugs.mockReset();
  mocks.showToast.mockReset();
  vi.restoreAllMocks();
});

describe("usePublishGathering in the house scope", () => {
  it("publishes through admin/music-events and calls no member follow-up", async () => {
    const onPublished = vi.fn();
    const { result } = renderHook(
      () =>
        usePublishGathering({
          form: formWithFollowUps,
          onPublished,
          onVenueRefused: vi.fn(),
        }),
      { wrapper: houseWrapper() },
    );
    act(() => {
      result.current.publish();
    });
    await waitFor(() => expect(result.current.isPublished).toBe(true));
    expect(mocks.createEvent).toHaveBeenCalledWith(HOUSE_PAYLOAD, "musicAdmin");
    expect(result.current.createdSlug).toBe(HOUSE_SLUG);
    expect(onPublished).toHaveBeenCalledTimes(1);
    expect(mocks.createCohostInvite).not.toHaveBeenCalled();
    expect(mocks.inviteGuestCommunity).not.toHaveBeenCalled();
    expect(mocks.switchOnGoTogetherForSlugs).not.toHaveBeenCalled();
  });

  it("names a coded refusal in the publish error toast", async () => {
    const refusal = new ApiError(404, "Not found", {
      code: "music_event_not_found",
    });
    mocks.createEvent.mockRejectedValue(refusal);
    const { result } = renderHook(
      () =>
        usePublishGathering({
          form: formWithFollowUps,
          onPublished: vi.fn(),
          onVenueRefused: vi.fn(),
        }),
      { wrapper: houseWrapper() },
    );
    act(() => {
      result.current.publish();
    });
    await waitFor(() => expect(mocks.showToast).toHaveBeenCalled());
    const codedReason = codedReasonFor(refusal);
    expect(codedReason).not.toBeNull();
    expect(mocks.showToast).toHaveBeenCalledWith(codedReason, "error");
    expect(result.current.isPublished).toBe(false);
  });

  it("keeps the generic publish line when the failure carries no reason", async () => {
    mocks.createEvent.mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(
      () =>
        usePublishGathering({
          form: formWithFollowUps,
          onPublished: vi.fn(),
          onVenueRefused: vi.fn(),
        }),
      { wrapper: houseWrapper() },
    );
    act(() => {
      result.current.publish();
    });
    await waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        "gatherings:create.toast.publishError",
        "error",
      ),
    );
  });
});
