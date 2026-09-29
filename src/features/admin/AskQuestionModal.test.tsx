import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AskQuestionModal } from "./AskQuestionModal";
import type { useAskListingQuestion } from "./api/useAskListingQuestion";
import type { ListingQueueRow } from "./api/adminListings.api";

/**
 * A platform-held suggestion (item #1 of the final fix wave): `submitterSlug`
 * is empty for a suggestion nobody has claimed, but the backend still
 * delivers the question to whoever suggested the place. The modal must read
 * `suggesterSlug`/`suggesterName` as a fallback rather than reporting "no
 * member to contact".
 */
function makeRow(overrides: Partial<ListingQueueRow> = {}): ListingQueueRow {
  return {
    ref: "QPL-1",
    slug: "cafe-jade",
    name: "Cafe Jade",
    hood: "Arroios",
    status: "review",
    submitterName: "",
    submitterSlug: "",
    suggesterName: "",
    suggesterSlug: "",
    createdAt: "2026-07-23T10:00:00Z",
    // Never read by this modal.
    detail: {} as ListingQueueRow["detail"],
    ...overrides,
  };
}

function stubAskQuestion(): ReturnType<typeof useAskListingQuestion> {
  return {
    isPending: false,
    mutateAsync: vi.fn(),
  } as unknown as ReturnType<typeof useAskListingQuestion>;
}

function renderModal(row: ListingQueueRow) {
  return render(
    <AskQuestionModal
      row={row}
      askQuestion={stubAskQuestion()}
      onClose={vi.fn()}
      onAsked={vi.fn()}
    />,
    { wrapper: TestProviders },
  );
}

describe("AskQuestionModal", () => {
  it("disables Send and hides the question field with neither a submitter nor a suggester", async () => {
    renderModal(makeRow());

    expect(
      await screen.findByText(
        "This listing has no member to contact. There's no one to send a question to.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send question" }),
    ).toBeDisabled();
  });

  it("enables Send and shows the suggester's name for a platform-held suggestion", async () => {
    renderModal(
      makeRow({ suggesterName: "Jane Doe", suggesterSlug: "jane-doe" }),
    );

    expect(
      await screen.findByText("We'll send this to Jane Doe as a message."),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    // Send stays disabled until a question is typed, same as the submitter path.
    expect(
      screen.getByRole("button", { name: "Send question" }),
    ).toBeDisabled();
  });
});
