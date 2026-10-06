import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Thread } from "../forum.data";
import type { ForumFundingView } from "./funding.types";
import { FundingAskFacts } from "./FundingAskFacts";

const { endAskMock, authorState } = vi.hoisted(() => ({
  endAskMock: vi.fn(),
  authorState: { isAuthor: true },
}));
vi.mock("./useEndFundingAsk", () => ({
  useEndFundingAsk: () => ({
    endAsk: endAskMock,
    isPending: false,
    demoEndedReason: null,
  }),
}));
vi.mock("./fundingPermissions", () => ({
  isFundingAuthor: () => authorState.isAuthor,
  canEditFundingDetails: () => false,
}));

const FUNDING: ForumFundingView = {
  linkUrl: "https://www.gofundme.com/f/rui",
  linkHost: "gofundme.com",
  funderName: null,
  amountMin: null,
  amountMax: null,
  deadline: null,
  eligibility: [],
  scope: null,
  callState: null,
  goalAmount: 2400,
  askPurpose: "healthcare",
  beneficiary: "someone_i_know",
  endsAt: null,
  endedAt: null,
  endedReason: null,
  approvedAt: "2026-07-10T09:00:00.000Z",
  askState: "active",
  updatedAt: "2026-07-10T09:00:00.000Z",
};
const THREAD: Thread = {
  id: 35,
  slug: "help-rui",
  category: "funding",
  kind: "ask",
  title: "Help Rui",
  excerpt: "",
  author: {
    initials: "IT",
    name: "Inês T",
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

const renderFacts = (funding: ForumFundingView) =>
  render(
    <TestProviders>
      <FundingAskFacts thread={{ ...THREAD, funding }} funding={funding} />
    </TestProviders>,
  );

describe("FundingAskFacts", () => {
  beforeEach(() => {
    endAskMock.mockReset();
    authorState.isAuthor = true;
  });

  it("says who holds the money and when moderators checked it", () => {
    renderFacts(FUNDING);
    expect(
      screen.getByText(
        /QueerPulse never handles money\. Donations go to gofundme\.com\. Checked by moderators on/,
      ),
    ).toBeInTheDocument();
  });

  it("sends donors to the host in a new tab", () => {
    renderFacts(FUNDING);
    const donate = screen.getByRole("link", {
      name: /Donate on gofundme\.com/,
    });
    expect(donate).toHaveAttribute("href", FUNDING.linkUrl);
    expect(donate).toHaveAttribute("target", "_blank");
    expect(donate).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });

  it("lets the author mark the goal reached after confirming", () => {
    renderFacts(FUNDING);
    fireEvent.click(screen.getByRole("button", { name: "Mark goal reached" }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Mark goal reached" }).at(-1)!,
    );
    expect(endAskMock.mock.calls[0]?.[0]).toBe("goal_reached");
  });

  it("offers nobody else the end controls", () => {
    authorState.isAuthor = false;
    renderFacts(FUNDING);
    expect(
      screen.queryByRole("button", { name: "Mark goal reached" }),
    ).toBeNull();
  });

  it("drops the donate button once the fundraiser has ended", () => {
    renderFacts({
      ...FUNDING,
      askState: "ended",
      endedReason: "goal_reached",
      endedAt: "2026-07-20T00:00:00.000Z",
    });
    expect(screen.queryByRole("link", { name: /Donate/ })).toBeNull();
    expect(
      screen.getByText("Goal reached. Thank you to everyone who gave."),
    ).toBeInTheDocument();
  });

  it("offers no donate button on a fundraiser still waiting for review", () => {
    renderFacts({ ...FUNDING, askState: "pending", approvedAt: null });
    expect(screen.queryByRole("link", { name: /Donate/ })).toBeNull();
    expect(
      screen.getByText(/A moderator checks it before it goes live/),
    ).toBeInTheDocument();
  });

  it("lets the author close a fundraiser still waiting for review, with no goal to mark", () => {
    renderFacts({ ...FUNDING, askState: "pending", approvedAt: null });
    expect(
      screen.queryByRole("button", { name: "Mark goal reached" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close fundraiser" }));
    fireEvent.click(screen.getByRole("button", { name: "Close it" }));
    expect(endAskMock.mock.calls[0]?.[0]).toBe("closed");
  });

  it("tells only the author that an edit sent the fundraiser back", () => {
    const sentBackCopy = /Sent back to moderators/;
    const pending: ForumFundingView = {
      ...FUNDING,
      askState: "pending",
      approvedAt: null,
    };
    authorState.isAuthor = false;
    const { rerender } = renderFacts(FUNDING);
    rerender(
      <TestProviders>
        <FundingAskFacts
          thread={{ ...THREAD, funding: pending }}
          funding={pending}
        />
      </TestProviders>,
    );
    expect(screen.queryByText(sentBackCopy)).toBeNull();

    authorState.isAuthor = true;
    rerender(
      <TestProviders>
        <FundingAskFacts
          thread={{ ...THREAD, funding: pending }}
          funding={pending}
        />
      </TestProviders>,
    );
    expect(screen.getByText(sentBackCopy)).toBeInTheDocument();
  });

  it("dates the moderators' check on the Lisbon calendar", () => {
    // 23:30 UTC on 10 July is already 11 July in Lisbon (UTC+1 in summer).
    renderFacts({ ...FUNDING, approvedAt: "2026-07-10T23:30:00.000Z" });
    expect(
      screen.getByText(/Checked by moderators on (11 July 2026|July 11, 2026)/),
    ).toBeInTheDocument();
  });
});
