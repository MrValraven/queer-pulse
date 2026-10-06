import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import type { Thread } from "../forum.data";
import type { ForumFundingView } from "./funding.types";
import { FundingEditModal } from "./FundingEditModal";

const { mutateMock, authorState } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  authorState: { isAuthor: true },
}));
vi.mock("./useUpdateThreadFunding", () => ({
  useUpdateThreadFunding: () => ({ mutate: mutateMock, isPending: false }),
}));
vi.mock("./fundingPermissions", () => ({
  isFundingAuthor: () => authorState.isAuthor,
  canEditFundingDetails: () => true,
}));

const VERIFICATION_REQUIRED_COPY =
  "Fundraisers need a verified phone so donors know who they're trusting.";

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
  goalAmount: 1500,
  askPurpose: "healthcare",
  beneficiary: "self",
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

function renderModal(isAuthor = true, funding: ForumFundingView = FUNDING) {
  authorState.isAuthor = isAuthor;
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

describe("FundingEditModal for a fundraiser", () => {
  beforeEach(() => mutateMock.mockReset());

  it("lets a member below phone verification edit, since the server checks the phone only at creation", () => {
    renderModal();
    expect(screen.getByDisplayValue("1500")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save details" }),
    ).not.toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Request verification" }),
    ).toBeNull();
  });

  it("shows a server verification refusal as an alert above the fields", () => {
    mutateMock.mockImplementation(
      (_input: unknown, options: { onError: (error: unknown) => void }) =>
        options.onError(
          new ApiError(403, "No", {
            code: "funding_ask_verification_required",
          }),
        ),
    );
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    // The toast region is an alert too, so pick the modal's own paragraph.
    const sectionAlert = screen
      .getAllByRole("alert")
      .find((element) => element.tagName === "P");
    expect(sectionAlert).toHaveTextContent(VERIFICATION_REQUIRED_COPY);
    expect(screen.getByDisplayValue("1500")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Request verification" }),
    ).toBeNull();
  });

  it("warns the author that saving sends the fundraiser back to moderators", () => {
    renderModal();
    expect(
      screen.getByText(
        "Saving sends your fundraiser back to moderators before it shows again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("1500")).toBeInTheDocument();
  });

  it("spares a moderator the warning, since their edit keeps it live", () => {
    renderModal(false);
    expect(screen.queryByText(/back to moderators/)).toBeNull();
  });

  it("sends an untouched last day back as stored, even in the repeated October hour", () => {
    const endsAt = "2026-10-25T00:30:00.000Z";
    renderModal(true, { ...FUNDING, endsAt });
    fireEvent.change(screen.getByDisplayValue("1500"), {
      target: { value: "2000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock.mock.calls[0]?.[0]).toMatchObject({
      goalAmount: 2000,
      endsAt,
    });
  });

  it("sends the author's own approved fundraiser back to review in demo", () => {
    mutateMock.mockImplementation(
      (_input: unknown, options: { onSuccess: (updated: null) => void }) =>
        options.onSuccess(null),
    );
    const { onSaved } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    expect(onSaved.mock.calls[0]?.[0]).toMatchObject({
      askState: "pending",
      approvedAt: null,
    });
  });

  it("keeps a fundraiser live when a moderator saves it in demo", () => {
    mutateMock.mockImplementation(
      (_input: unknown, options: { onSuccess: (updated: null) => void }) =>
        options.onSuccess(null),
    );
    const { onSaved } = renderModal(false);
    fireEvent.click(screen.getByRole("button", { name: "Save details" }));
    expect(onSaved.mock.calls[0]?.[0]).toMatchObject({
      askState: "active",
      approvedAt: FUNDING.approvedAt,
    });
  });
});
