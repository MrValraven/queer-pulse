import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ArticleCommentItem } from "./ArticleCommentItem";
import type { ReaderCommentDTO } from "./readerComments.api";

function makeComment(overrides: Partial<ReaderCommentDTO>): ReaderCommentDTO {
  return {
    id: "c-1",
    articleId: "a-1",
    parentId: null,
    author: { handle: "rita", displayName: "Rita Valente", avatarUrl: null },
    body: "A comment worth reading.",
    createdAt: "2026-08-01T10:00:00.000Z",
    editedAt: null,
    deleted: false,
    canEdit: false,
    canDelete: false,
    replies: [],
    ...overrides,
  };
}

function renderItem(comment: ReaderCommentDTO) {
  return render(
    <TestProviders>
      <ArticleCommentItem
        comment={comment}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReport={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("ArticleCommentItem (ENG-102: nothing to act on)", () => {
  it("offers Reply and Report on a readable comment", async () => {
    const { container } = renderItem(makeComment({}));

    expect(
      await within(container).findByRole("button", { name: "Reply" }),
    ).toBeInTheDocument();
    expect(
      within(container).getByRole("button", { name: "Report" }),
    ).toBeInTheDocument();
  });

  it("renders a tombstone with no live actions when the comment is deleted", async () => {
    const { container } = renderItem(
      makeComment({
        body: "",
        deleted: true,
        author: { handle: "", displayName: "", avatarUrl: null },
      }),
    );

    // Wait for the lazily loaded magazine catalog first: asserting a button is
    // absent before the copy arrives would pass against anything.
    expect(
      await screen.findByText("This comment was deleted."),
    ).toBeInTheDocument();
    expect(within(container).queryAllByRole("button")).toHaveLength(0);
  });

  it("treats a blanked-but-not-flagged comment as unavailable too", async () => {
    // What a moderation-HIDDEN row looks like on the wire today: the response
    // empties the body and the author, and leaves `deleted` false. It used to
    // render as an empty card carrying live Reply and Report buttons.
    const { container } = renderItem(
      makeComment({
        body: "",
        deleted: false,
        author: { handle: "", displayName: "", avatarUrl: null },
      }),
    );

    expect(
      await screen.findByText("This comment was deleted."),
    ).toBeInTheDocument();
    expect(within(container).queryAllByRole("button")).toHaveLength(0);
  });
});
