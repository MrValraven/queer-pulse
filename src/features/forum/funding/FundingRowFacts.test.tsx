import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { Thread } from "../forum.data";
import type { ForumFundingView } from "./funding.types";
import { FundingRowFacts } from "./FundingRowFacts";

const DAY_MS = 24 * 60 * 60 * 1000;
const FUNDING: ForumFundingView = {
  linkUrl: "https://example.org/call",
  linkHost: "example.org",
  funderName: "Fundação Maré",
  amountMin: 500,
  amountMax: 2000,
  deadline: new Date(Date.now() + 3 * DAY_MS + 3_600_000).toISOString(),
  eligibility: ["collectives", "students"],
  scope: "national",
  callState: "closing",
  goalAmount: null,
  askPurpose: null,
  beneficiary: null,
  endsAt: null,
  endedAt: null,
  endedReason: null,
  approvedAt: null,
  askState: null,
  updatedAt: new Date().toISOString(),
};

function thread(overrides: Partial<Thread>): Thread {
  return {
    id: 1,
    category: "funding",
    title: "A call",
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

const renderRow = (value: Thread) =>
  render(
    <TestProviders>
      <FundingRowFacts thread={value} />
    </TestProviders>,
  );

describe("FundingRowFacts", () => {
  it("shows funder, amount range, countdown and who can apply", () => {
    renderRow(thread({ kind: "call", funding: FUNDING }));
    expect(screen.getByText("Fundação Maré")).toBeInTheDocument();
    expect(screen.getByText("€500 to €2,000")).toBeInTheDocument();
    expect(screen.getByText("Closes in 3 days")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Who can apply" }),
    ).toHaveTextContent("Collectives");
  });

  it("mutes a closed call", () => {
    renderRow(
      thread({
        kind: "call",
        funding: {
          ...FUNDING,
          callState: "closed",
          deadline: new Date(Date.now() - DAY_MS).toISOString(),
        },
      }),
    );
    expect(screen.getByText(/^Closed/).closest("[data-tone]")).toHaveAttribute(
      "data-tone",
      "muted",
    );
  });

  it("renders nothing on a thread with no funding", () => {
    const { container } = renderRow(thread({}));
    expect(container).toBeEmptyDOMElement();
  });
});
