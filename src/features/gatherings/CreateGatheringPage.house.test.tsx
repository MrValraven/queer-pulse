import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { ManagedListingItem } from "../marketing/listBusiness/api/managedListings.api";
import {
  REVIEW_CHAPTER_INDEX,
  chapterBodyId,
  chapterIndexOf,
} from "./createGathering.data";
import { CreateGatheringWizard } from "./CreateGatheringPage";
import {
  EventHostScopeContext,
  MEMBER_HOST_SCOPE,
  type EventHostScope,
} from "./eventHostScope";
import type { CreateGatheringDraftOptions } from "./useCreateGatheringDraft";
import type { usePublishGathering } from "./usePublishGathering";

type PublishOptions = Parameters<typeof usePublishGathering>[0];

const mocks: {
  draftCalls: CreateGatheringDraftOptions[];
  publishCalls: PublishOptions[];
  forget: Mock<() => void>;
  /** Set to a slug to land the wizard on its success screen. */
  publishedSlug: string | null;
} = vi.hoisted(() => ({
  draftCalls: [],
  publishCalls: [],
  forget: vi.fn<() => void>(),
  publishedSlug: null,
}));

const managedTour: ManagedListingItem = {
  id: "listing-uuid-1",
  ref: "QPL-2026-0101",
  slug: "lisboa-arco-iris-walks",
  name: "Lisboa Arco-Íris Walks",
  kind: "mobile",
  meetingPoint: null,
};

vi.mock("./useCreateGatheringDraft", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./useCreateGatheringDraft")>()),
  useCreateGatheringDraft: (options: CreateGatheringDraftOptions) => {
    mocks.draftCalls.push(options);
    return {
      saveStatus: { kind: "idle" },
      resumeOffer: null,
      resume: vi.fn(),
      startFresh: vi.fn(),
      conflict: null,
      isConflictBusy: false,
      loadNewer: vi.fn(),
      keepThisVersion: vi.fn(),
      forget: mocks.forget,
      isNoteShown: false,
    };
  },
}));
vi.mock("./usePublishGathering", () => ({
  usePublishGathering: (options: PublishOptions) => {
    mocks.publishCalls.push(options);
    return {
      publish: vi.fn(),
      isPending: false,
      isPublished: mocks.publishedSlug !== null,
      createdSlug: mocks.publishedSlug,
      occurrenceSlugs: mocks.publishedSlug ? [mocks.publishedSlug] : [],
    };
  },
}));
// The member hosts with a community and runs a business, so every omission
// below is the scope's doing.
vi.mock("./useHostableCommunities", () => ({
  useHostableCommunities: () => ({
    options: [{ slug: "queer-runners", name: "Queer Runners" }],
    isResolving: false,
  }),
  useDropUnhostableCommunity: () => undefined,
}));
vi.mock("../marketing/listBusiness/api/useManagedListings", () => ({
  useManagedListings: () => ({ items: [managedTour], isResolving: false }),
}));

const HOUSE_TEST_SCOPE: EventHostScope = {
  ...MEMBER_HOST_SCOPE,
  apiTarget: "musicAdmin",
  isHouseEvent: true,
  fixedFamily: "music",
  allowedVisibilities: ["members", "invite_only"],
  managePathFor: (slug) => `/admin/music-events/${slug}`,
};

const PUBLISHED_HOUSE_SLUG = "queerpulse-club-night-x1";

function HouseScope({ children }: { children: ReactNode }) {
  return (
    <EventHostScopeContext.Provider value={HOUSE_TEST_SCOPE}>
      {children}
    </EventHostScopeContext.Provider>
  );
}

/** The "Who is it for?" chapter body, rendered even while folded shut. */
function whoChapterBody(): HTMLElement {
  const body = document.getElementById(chapterBodyId(chapterIndexOf("who")));
  if (body === null) throw new Error("the Who chapter body is missing");
  return body;
}

/** The review chapter body, which holds the recap groups. */
function reviewChapterBody(): HTMLElement {
  const body = document.getElementById(chapterBodyId(REVIEW_CHAPTER_INDEX));
  if (body === null) throw new Error("the review chapter body is missing");
  return body;
}

function renderHouseWizard() {
  return render(
    <HouseScope>
      <CreateGatheringWizard />
    </HouseScope>,
    { wrapper: TestProviders },
  );
}

beforeEach(() => {
  mocks.draftCalls.length = 0;
  mocks.publishCalls.length = 0;
  mocks.forget.mockReset();
  mocks.publishedSlug = null;
});

describe("CreateGatheringWizard in the house scope", () => {
  it("hides community, Run by, cohosts, guest communities and Go Together in the house scope", async () => {
    renderHouseWizard();
    const who = within(whoChapterBody());
    expect(await who.findByText("Invite only")).toBeInTheDocument();
    expect(who.queryByText("Host it with a community")).toBeNull();
    expect(who.queryByText("Run by one of your businesses")).toBeNull();
    expect(who.queryByText("Co-hosts")).toBeNull();
    expect(who.queryByText("Guest communities")).toBeNull();
    expect(who.queryByText("Offer Go together")).toBeNull();
  });

  it("offers Public and Invite only as the audience", async () => {
    renderHouseWizard();
    const who = within(whoChapterBody());
    expect(await who.findByText("Invite only")).toBeInTheDocument();
    expect(who.getByText("Public")).toBeInTheDocument();
    expect(who.queryByText("Connections of connections")).toBeNull();
    expect(who.queryByText("Network only")).toBeNull();
  });

  it("never offers, saves or forgets the member's draft", async () => {
    renderHouseWizard();
    await within(whoChapterBody()).findByText("Invite only");
    const lastDraftOptions = mocks.draftCalls.at(-1);
    const lastPublishOptions = mocks.publishCalls.at(-1);
    if (!lastDraftOptions || !lastPublishOptions) {
      throw new Error("the wizard never read its draft or publish hooks");
    }
    expect(lastDraftOptions.shouldOfferResume).toBe(false);
    expect(lastDraftOptions.isSavingEnabled).toBe(false);
    lastPublishOptions.onPublished();
    expect(mocks.forget).not.toHaveBeenCalled();
  });

  it("leaves the community, guest communities and co-hosts rows out of the review", async () => {
    renderHouseWizard();
    const review = within(reviewChapterBody());
    expect(await review.findByText("Who can see it")).toBeInTheDocument();
    expect(review.queryByText("Community")).toBeNull();
    expect(review.queryByText("Guest communities")).toBeNull();
    expect(review.queryByText("Co-hosts")).toBeNull();
  });

  it("offers Manage event on the success screen, linked to the admin manage page", async () => {
    mocks.publishedSlug = PUBLISHED_HOUSE_SLUG;
    renderHouseWizard();
    const manageLink = await screen.findByRole("link", {
      name: "Manage event",
    });
    expect(manageLink).toHaveAttribute(
      "href",
      `/admin/music-events/${PUBLISHED_HOUSE_SLUG}`,
    );
  });
});

describe("CreateGatheringWizard in the member scope", () => {
  it("the member wizard still offers community, Run by and cohosts", async () => {
    render(<CreateGatheringWizard />, { wrapper: TestProviders });
    const who = within(whoChapterBody());
    expect(
      await who.findByText("Host it with a community"),
    ).toBeInTheDocument();
    expect(who.getByText("Run by one of your businesses")).toBeInTheDocument();
    expect(who.getByText("Co-hosts")).toBeInTheDocument();
    const review = within(reviewChapterBody());
    expect(review.getByText("Community")).toBeInTheDocument();
    expect(review.getByText("Guest communities")).toBeInTheDocument();
    expect(review.getByText("Co-hosts")).toBeInTheDocument();
  });
});
