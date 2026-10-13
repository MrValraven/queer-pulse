import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { GuestCommunityDraftEntry } from "./api/eventCommunities.api";
import type { GatheringForm } from "./useGatheringForm";
import { usePublishGathering } from "./usePublishGathering";

const { inviteGuestCommunity, showToast } = vi.hoisted(() => ({
  inviteGuestCommunity: vi.fn(),
  showToast: vi.fn(),
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

vi.mock("./api/eventCommunities.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/eventCommunities.api")>()),
  inviteGuestCommunity,
}));
vi.mock("./api/useEventMutations", () => ({
  useCreateEvent: () => ({
    isPending: false,
    mutate: (
      _payload: unknown,
      options: {
        onSuccess: (result: { slug: string }) => void;
        onSettled?: () => void;
      },
    ) => {
      options.onSuccess({ slug: "new-gathering" });
      options.onSettled?.();
    },
  }),
}));
vi.mock("./api/events.adapters", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/events.adapters")>()),
  formToCreateEventDto: () => ({ startAt: "2026-11-01T19:00:00.000Z" }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

const rainbowArts: GuestCommunityDraftEntry = {
  slug: "rainbow-arts",
  name: "Rainbow Arts Collective",
  accessTier: "request",
  status: "unsent",
};

function formWith(communitySlug: string): GatheringForm {
  return {
    cohostSlugs: [],
    goTogetherEnabled: false,
    communitySlug,
    guestCommunities: [rainbowArts],
  } as unknown as GatheringForm;
}

function renderPublish(communitySlug: string) {
  return renderHook(
    () =>
      usePublishGathering({
        form: formWith(communitySlug),
        onPublished: vi.fn(),
        onVenueRefused: vi.fn(),
      }),
    { wrapper },
  );
}

beforeEach(() => {
  inviteGuestCommunity.mockResolvedValue({});
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  inviteGuestCommunity.mockReset();
  showToast.mockReset();
  vi.restoreAllMocks();
});

describe("usePublishGathering guest communities", () => {
  it("invites each guest onto the new gathering once it is created", () => {
    const { result } = renderPublish("queer-runners");
    act(() => {
      result.current.publish();
    });
    expect(inviteGuestCommunity).toHaveBeenCalledWith(
      "new-gathering",
      "rainbow-arts",
    );
  });

  it("invites no guest when no lead community is set", () => {
    const { result } = renderPublish("");
    act(() => {
      result.current.publish();
    });
    expect(inviteGuestCommunity).not.toHaveBeenCalled();
  });

  it("warns and still publishes when an invite is rejected", async () => {
    inviteGuestCommunity.mockRejectedValue(new Error("refused"));
    const onPublished = vi.fn();
    const { result } = renderHook(
      () =>
        usePublishGathering({
          form: formWith("queer-runners"),
          onPublished,
          onVenueRefused: vi.fn(),
        }),
      { wrapper },
    );
    act(() => {
      result.current.publish();
    });
    await vi.waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(expect.any(String), "warning"),
    );
    expect(onPublished).toHaveBeenCalled();
  });
});
