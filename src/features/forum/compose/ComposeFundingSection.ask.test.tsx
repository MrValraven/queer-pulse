import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { AskEligibility } from "../funding/useAskEligibility";
import type { FundingLinkLookup } from "../funding/useFundingLinkLookup";
import {
  ComposeAskPaymentNotice,
  ComposeFundingSection,
} from "./ComposeFundingSection";
import {
  EMPTY_COMPOSE_FUNDING,
  withInlineFundingPointers,
} from "./composeFunding";
import type { ComposeFunding } from "./composeThread.types";
import type { FundingErrorCode } from "../funding/funding.types";

const LOOKUP: FundingLinkLookup = {
  status: "idle",
  match: null,
  isDuplicateUnconfirmed: false,
  check: vi.fn(),
  dismiss: vi.fn(),
};
const ASK: ComposeFunding = {
  ...EMPTY_COMPOSE_FUNDING,
  linkUrl: "https://gofundme.com/f/rui",
  goalAmount: "1500",
  askPurpose: "healthcare",
  beneficiary: "self",
};

function renderAsk(
  status: AskEligibility["status"],
  options: {
    funding?: ComposeFunding;
    body?: string;
    serverErrorCode?: FundingErrorCode | null;
  } = {},
) {
  render(
    <TestProviders>
      <ComposeFundingSection
        kind="ask"
        funding={options.funding ?? ASK}
        onChange={vi.fn()}
        onToggleEligibility={vi.fn()}
        lookup={LOOKUP}
        serverErrorCode={options.serverErrorCode ?? null}
        title="Help Rui"
        body={options.body ?? "Rui needs six weeks off work."}
        askEligibility={{ status, refresh: vi.fn() }}
      />
    </TestProviders>,
  );
}

describe("ComposeFundingSection for a fundraiser", () => {
  it("puts the verification gate in place of the form below phone level", () => {
    renderAsk("needsPhone");
    expect(
      screen.getByText(
        "Fundraisers need a verified phone so donors know who they're trusting.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request verification" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Goal/)).toBeNull();
  });

  it("waits quietly while the verification level loads", () => {
    renderAsk("checking");
    expect(screen.getByText("Checking your verification…")).toHaveAttribute(
      "role",
      "status",
    );
  });

  it("shows the review note and the fields once verified", () => {
    renderAsk("allowed");
    expect(
      screen.getByText(
        "Moderators check every fundraiser before it goes live.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal/)).toBeInTheDocument();
  });

  it("switches to the gate when the server says verification is missing", () => {
    renderAsk("allowed", {
      serverErrorCode: "funding_ask_verification_required",
    });
    expect(
      screen.getByRole("button", { name: "Request verification" }),
    ).toBeInTheDocument();
  });

  it("flags a host off the allow-list under the link", () => {
    renderAsk("allowed", {
      funding: { ...ASK, linkUrl: "https://gofundme.com.evil.io/f" },
    });
    expect(
      screen.getByText(/Fundraisers can only link to/),
    ).toBeInTheDocument();
    // The error takes the hint's place, so the host list shows once.
    expect(screen.queryByText(/^One of:/)).toBeNull();
  });
});

describe("ComposeAskPaymentNotice", () => {
  const PAYMENT_COPY =
    "Take the IBAN or phone number out. Donations go through the fundraising page.";

  it("says it under the body when the text carries a payment detail", () => {
    render(
      <TestProviders>
        <ComposeAskPaymentNotice title="Help Rui" body="MB Way 912 345 678" />
      </TestProviders>,
    );
    expect(screen.getByText(PAYMENT_COPY)).toHaveAttribute("role", "alert");
  });

  it("stays away from a clean text", () => {
    render(
      <TestProviders>
        <ComposeAskPaymentNotice title="Help Rui" body="Six weeks off work." />
      </TestProviders>,
    );
    expect(screen.queryByText(PAYMENT_COPY)).toBeNull();
  });
});

describe("withInlineFundingPointers", () => {
  it("points the footer at a note already shown beside its field", () => {
    expect(
      withInlineFundingPointers([
        {
          id: "fundingHostNotAllowed",
          messageKey: "forum:composePage.blocker.fundingHostNotAllowed",
          values: { hosts: "ppl.pt" },
        },
        {
          id: "fundingIncomplete",
          messageKey: "forum:composePage.blocker.fundingAskIncomplete",
        },
      ]),
    ).toEqual([
      {
        id: "fundingHostNotAllowed",
        messageKey: "forum:composePage.foot.seeAbove",
      },
      {
        id: "fundingIncomplete",
        messageKey: "forum:composePage.blocker.fundingAskIncomplete",
      },
    ]);
  });

  it("keeps the host sentence in the footer while the link field is not on screen", () => {
    const hostBlocker = {
      id: "fundingHostNotAllowed" as const,
      messageKey: "forum:composePage.blocker.fundingHostNotAllowed",
      values: { hosts: "ppl.pt" },
    };
    expect(
      withInlineFundingPointers([hostBlocker], { isLinkFieldShown: false }),
    ).toEqual([hostBlocker]);
  });
});
