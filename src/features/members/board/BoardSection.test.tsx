import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { BoardSection } from "./BoardSection";
import { DEMO_BOARD_NOW_MS } from "./boardInsights.demo";
import type { MemberProfile } from "../data/memberProfiles";
import type { BoardItem } from "../data/members";
import type { BoardInsightsDTO } from "../api/boardInsights.api";

// BoardSection reads a pinned clock in demo mode (DEMO_BOARD_NOW_MS) rather
// than Date.now(), so every fixture's dates below are anchored to it and stay
// deterministic as the suite ages. See boardLifespan.ts / boardInsights.demo.ts.
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

// Only the profile owner's board-insights query ever resolves matches — a
// visitor's query is disabled (`enabled: isSelf` in the real hook) and its
// `data` is undefined, which this mock mirrors.
const insights: BoardInsightsDTO = {
  hellos: 5,
  replies: 5,
  windowDays: 90,
  matches: {
    "zine-collab": [
      {
        slug: "beatriz",
        first: "Beatriz",
        kind: "offering",
        postSlug: "riso-printing-help",
      },
    ],
  },
};

vi.mock("../api/useBoardInsights", () => ({
  useBoardInsights: (isSelf: boolean) => ({
    data: isSelf ? insights : undefined,
  }),
}));

const DAY_MS = 24 * 60 * 60 * 1000;

const ZINE_TITLE = "A collaborator for a queer zine";
const RISO_TITLE = "A spare riso drum, teal, barely used";
const PORTFOLIO_TITLE = "A second pair of eyes on a portfolio";

// A "looking" post (30-day window), active with 5 days left.
const zineCollab: BoardItem = {
  kind: "looking",
  title: ZINE_TITLE,
  slug: "zine-collab",
  status: "open",
  createdAt: new Date(DEMO_BOARD_NOW_MS - 25 * DAY_MS).toISOString(),
  expiresAt: new Date(DEMO_BOARD_NOW_MS + 5 * DAY_MS).toISOString(),
  responseCount: 0,
  responders: [],
};

// An "offering" post (90-day window) that lapsed 7 days ago. Open (never
// closed), so it stays in the owner's list but drops out of a visitor's.
const risoDrum: BoardItem = {
  kind: "offering",
  title: RISO_TITLE,
  slug: "riso-drum",
  status: "open",
  createdAt: new Date(DEMO_BOARD_NOW_MS - 97 * DAY_MS).toISOString(),
  expiresAt: new Date(DEMO_BOARD_NOW_MS - 7 * DAY_MS).toISOString(),
  responseCount: 0,
  responders: [],
};

// A second ACTIVE "offering" post (90-day window) with 43 days left, so the
// suite has two live posts on two different windows (30 vs 90) to prove the
// lifespan meter reads each post's own window instead of one shared figure.
const portfolioReviews: BoardItem = {
  kind: "offering",
  title: PORTFOLIO_TITLE,
  slug: "portfolio-reviews",
  status: "open",
  createdAt: new Date(DEMO_BOARD_NOW_MS - 47 * DAY_MS).toISOString(),
  expiresAt: new Date(DEMO_BOARD_NOW_MS + 43 * DAY_MS).toISOString(),
  responseCount: 0,
  responders: [],
};

const boardProfile = {
  slug: "ines",
  first: "Inês",
  visibility: "open",
  board: [zineCollab, risoDrum, portfolioReviews],
} as unknown as MemberProfile;

// A single active post. Used by the owner/visitor action tests below, which
// need exactly one row so a role query like `{ name: /renew/i }` can only
// ever match one button — `boardProfile` above deliberately carries more
// than one visible row, which would make those same queries match more than
// one element and throw.
const soloPost: BoardItem = {
  kind: "looking",
  title: "A proofreader for a grant application",
  slug: "grant-proofread",
  status: "open",
  createdAt: new Date(DEMO_BOARD_NOW_MS - 10 * DAY_MS).toISOString(),
  expiresAt: new Date(DEMO_BOARD_NOW_MS + 20 * DAY_MS).toISOString(),
  responseCount: 0,
  responders: [],
};

const soloProfile = {
  slug: "ines",
  first: "Inês",
  visibility: "open",
  board: [soloPost],
} as unknown as MemberProfile;

function renderSection(isSelf: boolean, profile: MemberProfile) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <MemoryRouter>
          <BoardSection profile={profile} isSelf={isSelf} />
        </MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

// The `members` catalog loads as its own lazy chunk (see
// shared/i18n/catalogs/index.ts), so any assertion on catalog-derived copy
// (a button label, the lifespan meter's text) is only true in the DOM after
// that import resolves: those use `findBy*`, which retries until it lands.
// A profile-data string (a post's own `title`) is never translated and is on
// screen on the very first render, so those use plain `getBy*`/`queryBy*`.
// A negative assertion about something the component never mounts at all —
// an expired post filtered out of `visible`, a match pill gated on `isSelf`
// — carries no such race either way, so those stay synchronous too.

describe("BoardSection viewer split on the lapsed post", () => {
  it("shows the owner their lapsed post and the repost action", async () => {
    renderSection(true, boardProfile);
    expect(screen.getByText(RISO_TITLE)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /repost/i }),
    ).toBeInTheDocument();
  });

  it("hides a lapsed post from a visitor entirely", () => {
    renderSection(false, boardProfile);
    expect(screen.queryByText(RISO_TITLE)).not.toBeInTheDocument();
    expect(screen.getByText(ZINE_TITLE)).toBeInTheDocument();
  });

  it("renders nothing for a visitor when every post has expired", () => {
    const allExpiredProfile = {
      ...boardProfile,
      board: [risoDrum],
    };
    const { container } = renderSection(false, allExpiredProfile);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("BoardSection reciprocal match pill", () => {
  it("shows the owner a match pill naming the member whose post answers theirs", async () => {
    renderSection(true, boardProfile);
    expect(await screen.findByText(/Beatriz/)).toBeInTheDocument();
  });

  it("never shows the match pill to a visitor, since it names a third member's post", () => {
    renderSection(false, boardProfile);
    expect(screen.queryByText(/Beatriz/)).not.toBeInTheDocument();
  });
});

describe("BoardSection lifespan meter", () => {
  it("reads each post's remaining days against its own window, not a shared figure", async () => {
    renderSection(false, boardProfile);
    expect(await screen.findByText(/5 days left/i)).toBeInTheDocument();
    expect(await screen.findByText(/of 30/i)).toBeInTheDocument();
    expect(await screen.findByText(/43 days left/i)).toBeInTheDocument();
    expect(await screen.findByText(/of 90/i)).toBeInTheDocument();
  });
});

describe("BoardSection owner vs visitor row actions", () => {
  it("gives the owner a renew action and mark-as-found, never the visitor's respond action", async () => {
    renderSection(true, soloProfile);
    expect(
      await screen.findByRole("button", { name: /renew/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mark as found/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /offer to help/i }),
    ).not.toBeInTheDocument();
  });

  it("gives a visitor the respond action and none of the owner's controls", async () => {
    renderSection(false, soloProfile);
    expect(
      await screen.findByRole("button", { name: /offer to help/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /renew/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /repost/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /mark as found/i }),
    ).not.toBeInTheDocument();
  });
});
