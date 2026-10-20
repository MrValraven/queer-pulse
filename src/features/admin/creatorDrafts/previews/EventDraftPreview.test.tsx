import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  CreatorDraftOwner,
  EventDraftPreview as EventDraftPreviewData,
} from "../../api/adminCreatorDrafts.api";
import { EventDraftPreview } from "./EventDraftPreview";

// The Where panel's basemap loads tiles, which jsdom cannot draw; the panel's
// rows are what these tests read.
vi.mock("../../../gatherings/GatheringWhereMap", () => ({
  GatheringWhereMap: () => null,
}));

// Spies on both name lookups, the live request and the resolving renderer,
// so a test can prove the description asks the server for nothing.
const mentionLookup = vi.hoisted(() => ({
  getMentionNames: vi.fn(),
  resolvedMentionTextRenders: vi.fn(),
}));
vi.mock("../../../../shared/mentions/mentionNames.api", () => ({
  getMentionNames: mentionLookup.getMentionNames,
}));
vi.mock(
  "../../../../shared/mentions/ResolvedMentionText",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../shared/mentions/ResolvedMentionText")
      >();
    return {
      ...actual,
      ResolvedMentionText: (
        props: Parameters<typeof actual.ResolvedMentionText>[0],
      ) => {
        mentionLookup.resolvedMentionTextRenders(props.text);
        return actual.ResolvedMentionText(props);
      },
    };
  },
);

const picnicPreview: EventDraftPreviewData = {
  title: "Sunday picnic in Monsanto",
  description:
    "Bring a blanket and something to share. We meet at the top of the park and walk down together.",
  family: "eat",
  format: "picnic",
  cap: "24",
  showAttendeeCount: true,
  date: "2026-11-01",
  time: "13:00",
  hood: "Monsanto",
  communitySlug: "rainbow-runners",
  audienceScope: "community",
  costKind: "free",
  themes: ["outdoors", "low-key"],
  houseRules: "Be kind, share the shade, take your rubbish home.",
  allowWaitlist: true,
  community: { slug: "rainbow-runners", name: "Rainbow Runners" },
  runByListing: null,
};

const marta: CreatorDraftOwner = {
  userId: "demo-user-marta",
  slug: "marta",
  firstName: "Marta",
  lastName: "Fonseca",
  avatarUrl: null,
};

function requestUrl(input: RequestInfo | URL): string {
  if (input instanceof Request) return input.url;
  return input instanceof URL ? input.href : input;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EventDraftPreview", () => {
  it("renders inside the guest preview and sends no RSVP", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(
      <TestProviders>
        <EventDraftPreview preview={picnicPreview} owner={marta} />
      </TestProviders>,
    );
    const frame = screen.getByRole("region", {
      name: /creatorDrafts\.preview\.label|preview/i,
    });
    expect(
      within(frame).getByRole("heading", {
        name: "Sunday picnic in Monsanto",
      }),
    ).toBeInTheDocument();
    for (const button of within(frame).queryAllByRole("button")) {
      await userEvent.click(button);
    }
    expect(
      fetchSpy.mock.calls.some(([input]) =>
        requestUrl(input).includes("/rsvp"),
      ),
    ).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows the description's mentions as typed and looks up no names", () => {
    mentionLookup.getMentionNames.mockClear();
    mentionLookup.resolvedMentionTextRenders.mockClear();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(
      <TestProviders>
        <EventDraftPreview
          preview={{
            ...picnicPreview,
            description:
              "Ask @ana-lopes about b/tasca-da-graca before you come.",
          }}
          owner={marta}
        />
      </TestProviders>,
    );
    const mention = screen.getByText("@ana-lopes");
    expect(mention.closest("a")).toBeNull();
    expect(screen.getByText("b/tasca-da-graca")).toBeInTheDocument();
    expect(mentionLookup.resolvedMentionTextRenders).not.toHaveBeenCalled();
    expect(mentionLookup.getMentionNames).not.toHaveBeenCalled();
    expect(
      fetchSpy.mock.calls.some(([input]) =>
        requestUrl(input).includes("/mentions/names"),
      ),
    ).toBe(false);
  });

  it("names the community as plain text", () => {
    render(
      <TestProviders>
        <EventDraftPreview preview={picnicPreview} owner={marta} />
      </TestProviders>,
    );
    const communityLine = screen.getByText(/Rainbow Runners/);
    expect(communityLine).toBeInTheDocument();
    expect(within(communityLine).queryByRole("link")).toBeNull();
    expect(communityLine.closest("a")).toBeNull();
  });

  it("names the owner as the host", () => {
    render(
      <TestProviders>
        <EventDraftPreview preview={picnicPreview} owner={marta} />
      </TestProviders>,
    );
    expect(screen.getByText(/Marta Fonseca/)).toBeInTheDocument();
  });

  it("hides an unset day and clock and survives a malformed payload", () => {
    const malformed = {
      title: 42,
      description: ["x"],
      date: "",
      time: 13,
      themes: "outdoors",
      community: { name: 7 },
      runByListing: { slug: null, name: 9 },
    } as unknown as EventDraftPreviewData;
    render(
      <TestProviders>
        <EventDraftPreview preview={malformed} owner={null} />
      </TestProviders>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.queryByText(/00:00/)).toBeNull();
    expect(screen.queryByText(/Hosted by/)).toBeNull();
  });
});
