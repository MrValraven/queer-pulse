import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { Thread } from "../forum/forum.data";
import { StudioOpenCallsLive } from "./StudioOpenCallsLive";

const threadsState = vi.hoisted(() => ({
  threads: [] as unknown[],
  isLoading: false,
  isError: false,
  hasNextPage: false,
  isFetchNextPageError: false,
  refetch: vi.fn(),
  fetchNextPage: vi.fn(),
}));
const useThreadsSpy = vi.hoisted(() => vi.fn());
vi.mock("../forum/api/useForum", () => ({
  useThreads: (category: string, options: unknown) => {
    useThreadsSpy(category, options);
    return {
      ...threadsState,
      isPending: threadsState.isLoading,
      isFetchingNextPage: false,
    };
  },
}));

const call = {
  id: 7,
  slug: "lisbon-music-grant",
  category: "funding",
  title: "Lisbon music grant",
  tags: ["open-call", "music"],
  funding: {
    linkUrl: "https://funder.example/call",
    linkHost: "funder.example",
    funderName: "Fundação Exemplo",
    amountMin: 500,
    amountMax: 2000,
    deadline: "2099-01-31T23:59:00.000Z",
    eligibility: ["individuals", "collectives"],
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
    updatedAt: "2026-10-01T10:00:00.000Z",
  },
} as unknown as Thread;

/** A thread the funding read can still return without its funding block;
 *  StudioFundingCallCard draws nothing for it. */
const unfundedThread = {
  id: 8,
  slug: "music-meetup-notes",
  category: "funding",
  title: "Music meetup notes",
  tags: ["music"],
  funding: null,
} as unknown as Thread;

beforeEach(() => {
  Object.assign(threadsState, {
    threads: [],
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchNextPageError: false,
  });
  threadsState.refetch.mockClear();
  useThreadsSpy.mockClear();
});

function renderLive() {
  render(
    <TestProviders>
      <StudioOpenCallsLive />
    </TestProviders>,
  );
}

describe("open calls (live)", () => {
  it("reads open Funding calls tagged music", () => {
    renderLive();
    expect(useThreadsSpy).toHaveBeenCalledWith("funding", {
      fundingView: "open",
      tag: "music",
    });
  });

  it("shows each call with funder, amount, eligibility and scope, linking to its thread", async () => {
    threadsState.threads = [call];
    renderLive();
    const list = await screen.findByRole("list", {
      name: /open calls for music/i,
    });
    expect(
      within(list).getByRole("link", { name: "Lisbon music grant" }),
    ).toHaveAttribute("href", "/thread/lisbon-music-grant");
    expect(within(list).getByText("Fundação Exemplo")).toBeInTheDocument();
  });

  it("says there are none and links to every open call", async () => {
    renderLive();
    expect(
      await screen.findByText("No open calls for music right now"),
    ).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: "See all open calls" });
    expect(links.map((link) => link.getAttribute("href"))).toContain(
      "/forum?category=funding&fundingView=open",
    );
    expect(
      screen.getByRole("link", { name: /See music calls in Funding & Grants/ }),
    ).toBeInTheDocument();
  });

  it("keeps the error panel up while Retry runs", async () => {
    threadsState.isError = true;
    renderLive();
    fireEvent.click(
      await screen.findByRole("button", { name: /try again|retry/i }),
    );
    expect(threadsState.refetch).toHaveBeenCalled();
  });

  it("keeps loaded calls when a later page fails", async () => {
    threadsState.threads = [call];
    threadsState.isError = true;
    threadsState.isFetchNextPageError = true;
    threadsState.hasNextPage = true;
    renderLive();
    expect(
      await screen.findByRole("link", { name: "Lisbon music grant" }),
    ).toBeInTheDocument();
    expect(screen.getByText("We couldn't load more calls")).toBeInTheDocument();
  });

  it("lists only the funded calls and leaves no empty list item", async () => {
    threadsState.threads = [unfundedThread, call];
    renderLive();
    const list = await screen.findByRole("list", {
      name: /open calls for music/i,
    });
    const listItems = within(list).getAllByRole("listitem");
    expect(listItems).toHaveLength(1);
    expect(listItems[0]).not.toBeEmptyDOMElement();
    expect(
      within(list).getByRole("link", { name: "Lisbon music grant" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Music meetup notes")).not.toBeInTheDocument();
  });

  it("says there are none when no thread carries funding and no page is left", async () => {
    threadsState.threads = [unfundedThread];
    threadsState.hasNextPage = false;
    renderLive();
    expect(
      await screen.findByText("No open calls for music right now"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: /open calls for music/i }),
    ).not.toBeInTheDocument();
  });

  it("offers no load more when a refetch fails on a fully loaded list", async () => {
    threadsState.threads = [call];
    threadsState.isError = true;
    threadsState.isFetchNextPageError = false;
    threadsState.hasNextPage = false;
    renderLive();
    expect(
      await screen.findByRole("link", { name: "Lisbon music grant" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load more calls"),
    ).not.toBeInTheDocument();
  });
});
