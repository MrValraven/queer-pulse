import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import type { Thread } from "../forum.data";
import type { ForumFundingView } from "./funding.types";
import { FundingCallFacts } from "./FundingCallFacts";

const { demoModeState } = vi.hoisted(() => ({
  demoModeState: { isDemoMode: true },
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useDemoMode: () => ({
    demoMode: demoModeState.isDemoMode,
    available: false,
    setDemoMode: vi.fn(),
  }),
}));

const NOW = Date.parse("2026-07-20T12:00:00.000Z");
const FUNDING: ForumFundingView = {
  linkUrl: "https://example.org/mare/apoio",
  linkHost: "example.org",
  funderName: "Fundação Maré",
  amountMin: 500,
  amountMax: 2000,
  deadline: "2026-07-31T16:00:00.000Z",
  eligibility: ["collectives"],
  scope: "national",
  callState: "open",
  goalAmount: null,
  askPurpose: null,
  beneficiary: null,
  endsAt: null,
  endedAt: null,
  endedReason: null,
  approvedAt: null,
  askState: null,
  updatedAt: "2026-07-01T00:00:00.000Z",
};
const THREAD: Thread = {
  id: 30,
  slug: "mare-2026",
  category: "funding",
  kind: "call",
  title: "Maré 2026",
  excerpt: "",
  author: {
    initials: "SB",
    name: "Sofia B",
    background: "var(--plum)",
    color: "var(--paper)",
  },
  posted: "now",
  upvotes: 0,
  comments: 0,
  tags: [],
  body: [],
  replies: [],
  funding: FUNDING,
};

function renderFacts(
  funding: ForumFundingView,
  viewerTimeZone = "Europe/Lisbon",
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  // A minimal tree, the one `useThread.notFound.live.test.tsx` uses: the full
  // TestProviders set would start live session requests once demo is off.
  render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <FundingCallFacts
          thread={THREAD}
          funding={funding}
          bookmarked={false}
          onToggleBookmark={vi.fn()}
          viewerTimeZone={viewerTimeZone}
        />
      </I18nProvider>
    </QueryClientProvider>,
  );
  return { invalidate };
}

describe("FundingCallFacts", () => {
  beforeEach(() => {
    demoModeState.isDemoMode = true;
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("opens the call in a new tab without passing on referrer or rank", () => {
    renderFacts(FUNDING);
    const link = screen.getByRole("link", { name: /Open the call/ });
    expect(link).toHaveAttribute("href", FUNDING.linkUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });

  it("states the deadline in Lisbon time and adds the viewer's own time when it differs", () => {
    renderFacts(FUNDING, "America/New_York");
    expect(screen.getByText(/17:00, Lisbon time/)).toBeInTheDocument();
    expect(screen.getByText(/Your time: .*12:00/)).toBeInTheDocument();
  });

  it("keeps a Lisbon viewer to one line", () => {
    renderFacts(FUNDING);
    expect(screen.queryByText(/Your time/)).toBeNull();
  });

  it("offers the reminder hint on an open call with a deadline only", () => {
    renderFacts(FUNDING);
    expect(
      screen.getByText("Save it and we'll remind you 7 days and 1 day before."),
    ).toBeInTheDocument();
  });

  it("drops the reminder hint on a rolling call", () => {
    renderFacts({ ...FUNDING, deadline: null });
    expect(screen.queryByText(/remind you/)).toBeNull();
  });

  it("turns into Closed when the deadline passes on screen, and refetches once", () => {
    demoModeState.isDemoMode = false;
    const { invalidate } = renderFacts({
      ...FUNDING,
      deadline: new Date(NOW + 30_000).toISOString(),
      callState: "closing",
    });
    expect(screen.getByText(/Closes within the hour/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(61_000);
    });
    expect(screen.getAllByText(/Closed/).length).toBeGreaterThan(0);
    act(() => {
      vi.advanceTimersByTime(61_000);
    });
    expect(
      invalidate.mock.calls.filter(([filters]) =>
        JSON.stringify(filters).includes("forum-thread-meta"),
      ),
    ).toHaveLength(1);
  });
});

describe("FundingCallFacts at the deadline", () => {
  beforeEach(() => {
    demoModeState.isDemoMode = true;
    vi.useFakeTimers({
      toFake: [
        "Date",
        "setInterval",
        "clearInterval",
        "setTimeout",
        "clearTimeout",
      ],
    });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("reads Closed right after the deadline, before the next minute tick", () => {
    // Past the first minute tick and well short of the second one.
    const deadlineOffsetMs = 90_500;
    renderFacts({
      ...FUNDING,
      deadline: new Date(NOW + deadlineOffsetMs).toISOString(),
      callState: "closing",
    });
    expect(screen.getByText(/Closes within the hour/)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(deadlineOffsetMs + 1_500);
    });
    expect(screen.queryByText(/Closes within the hour/)).toBeNull();
    expect(screen.getAllByText(/Closed/).length).toBeGreaterThan(0);
  });
});

describe("FundingCallFacts on a closed call", () => {
  beforeEach(() => {
    demoModeState.isDemoMode = true;
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("offers the call to read, with a quieter label", () => {
    renderFacts({
      ...FUNDING,
      deadline: "2026-07-01T16:00:00.000Z",
      callState: "closed",
    });
    expect(
      screen.getByRole("link", { name: /See the call on example\.org/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open the call/ })).toBeNull();
  });
});
