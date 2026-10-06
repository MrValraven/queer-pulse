import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import type { Thread } from "../forum.data";
import type { ForumFundingView } from "./funding.types";
import { FundingEditModal } from "./FundingEditModal";

const { mutateMock } = vi.hoisted(() => ({ mutateMock: vi.fn() }));
vi.mock("./useUpdateThreadFunding", () => ({
  useUpdateThreadFunding: () => ({ mutate: mutateMock, isPending: false }),
}));

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

function renderModal(funding: ForumFundingView = FUNDING) {
  const onSaved = vi.fn();
  render(
    <TestProviders>
      <FundingEditModal
        thread={{ ...THREAD, funding }}
        funding={funding}
        onClose={vi.fn()}
        onSaved={onSaved}
      />
    </TestProviders>,
  );
  return { onSaved };
}

describe("FundingEditModal", () => {
  beforeEach(() => mutateMock.mockReset());

  it("opens on a closed call's details and saves them although the deadline has passed", () => {
    renderModal();
    expect(screen.getByDisplayValue("Fundação Maré")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    expect(mutateMock.mock.calls[0]?.[0]).toMatchObject({
      funderName: "Fundação Maré",
      deadline: "2026-07-31T16:00:00.000Z",
      amountMin: 500,
      amountMax: 2000,
      scope: "national",
    });
  });

  it("sends the stored deadline unchanged when only the funder is edited, in the repeated October hour", () => {
    const repeatedHour = "2026-10-25T00:30:00.000Z";
    renderModal({ ...FUNDING, deadline: repeatedHour });
    fireEvent.change(screen.getByDisplayValue("Fundação Maré"), {
      target: { value: "Fundação Maré Norte" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    expect(mutateMock.mock.calls[0]?.[0]).toMatchObject({
      funderName: "Fundação Maré Norte",
      deadline: repeatedHour,
    });
  });

  it("holds the save while a required field is empty", () => {
    renderModal();
    fireEvent.change(screen.getByDisplayValue("Fundação Maré"), {
      target: { value: "" },
    });
    expect(screen.getByRole("button", { name: "Save details" })).toBeDisabled();
  });

  it("shows the server's refusal under the link", () => {
    mutateMock.mockImplementation(
      (_input, options: { onError: (error: unknown) => void }) =>
        options.onError(
          new ApiError(400, "Bad", { code: "funding_link_invalid" }),
        ),
    );
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    expect(
      screen.getAllByText(
        "That link didn't work. Use the full address, starting with https://.",
      ).length,
    ).toBeGreaterThan(0);
  });
});
