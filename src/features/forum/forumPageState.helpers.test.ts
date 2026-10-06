import { describe, expect, it } from "vitest";
import type { Thread } from "./forum.data";
import type { ForumFundingView } from "./funding/funding.types";
import {
  canMoveThreadCategory,
  filterAndSortThreads,
  type FundingListFilter,
} from "./forumPageState.helpers";

const BASE_FUNDING: ForumFundingView = {
  linkUrl: "https://example.org/call",
  linkHost: "example.org",
  funderName: "Maré",
  amountMin: null,
  amountMax: null,
  deadline: null,
  eligibility: [],
  scope: null,
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

function thread(id: number, overrides: Partial<Thread> = {}): Thread {
  return {
    id,
    category: "funding",
    title: `Thread ${id}`,
    excerpt: "",
    author: {
      initials: "AB",
      name: "A B",
      background: "var(--plum)",
      color: "var(--paper)",
    },
    posted: "now",
    upvotes: 0,
    comments: 0,
    tags: [],
    body: [],
    replies: [],
    ...overrides,
  };
}

const call = (id: number, funding: Partial<ForumFundingView>) =>
  thread(id, { kind: "call", funding: { ...BASE_FUNDING, ...funding } });
const ask = (id: number, funding: Partial<ForumFundingView>) =>
  thread(id, {
    kind: "ask",
    funding: { ...BASE_FUNDING, callState: null, ...funding },
  });

const LIST = [
  call(1, {
    deadline: "2026-09-01T00:00:00.000Z",
    callState: "open",
    eligibility: ["students"],
    scope: "eu",
  }),
  call(2, {
    deadline: "2026-07-25T00:00:00.000Z",
    callState: "closing",
    eligibility: ["collectives"],
    scope: "national",
  }),
  call(3, { deadline: "2026-06-01T00:00:00.000Z", callState: "closed" }),
  call(4, { deadline: null, callState: "open" }),
  ask(5, { askState: "active", approvedAt: "2026-07-10T00:00:00.000Z" }),
  ask(6, { askState: "ended", approvedAt: "2026-07-01T00:00:00.000Z" }),
  thread(7),
];

const options = (funding: FundingListFilter, demoMode = true) => ({
  demoMode,
  cat: "funding",
  tag: undefined,
  q: "",
  sort: "active" as const,
  funding,
});
const ids = (threads: Thread[]) => threads.map((entry) => entry.id);

describe("filterAndSortThreads funding views (demo)", () => {
  it("lists open and closing calls by deadline, rolling calls last", () => {
    expect(
      ids(
        filterAndSortThreads(
          LIST,
          options({ view: "open", eligibility: [], scope: null }),
        ),
      ),
    ).toEqual([2, 1, 4]);
  });

  it("lists closing calls only", () => {
    expect(
      ids(
        filterAndSortThreads(
          LIST,
          options({ view: "closing", eligibility: [], scope: null }),
        ),
      ),
    ).toEqual([2]);
  });

  it("lists active fundraisers only", () => {
    expect(
      ids(
        filterAndSortThreads(
          LIST,
          options({ view: "asks", eligibility: [], scope: null }),
        ),
      ),
    ).toEqual([5]);
  });

  it("lists threads with no funding details as discussion", () => {
    expect(
      ids(
        filterAndSortThreads(
          LIST,
          options({ view: "discussion", eligibility: [], scope: null }),
        ),
      ),
    ).toEqual([7]);
  });

  it("matches any chosen eligibility value and the chosen scope", () => {
    expect(
      ids(
        filterAndSortThreads(
          LIST,
          options({
            view: "open",
            eligibility: ["students", "companies"],
            scope: null,
          }),
        ),
      ),
    ).toEqual([1]);
    expect(
      ids(
        filterAndSortThreads(
          LIST,
          options({ view: "open", eligibility: [], scope: "national" }),
        ),
      ),
    ).toEqual([2]);
  });
});

describe("filterAndSortThreads funding views (live)", () => {
  it("renders the server's narrowed list exactly as it arrived", () => {
    expect(
      ids(
        filterAndSortThreads(
          LIST,
          options(
            { view: "open", eligibility: ["students"], scope: "eu" },
            false,
          ),
        ),
      ),
    ).toEqual(ids(LIST));
  });
});

describe("canMoveThreadCategory", () => {
  it("keeps calls and fundraisers in Funding & Grants, even for moderators", () => {
    expect(canMoveThreadCategory({ ...call(1, {}), canPin: true })).toBe(false);
    expect(
      canMoveThreadCategory({ ...ask(5, {}), canPin: true, canLock: true }),
    ).toBe(false);
    expect(canMoveThreadCategory({ ...thread(7), canPin: true })).toBe(true);
  });
});
