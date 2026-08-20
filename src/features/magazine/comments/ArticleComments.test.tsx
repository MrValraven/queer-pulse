import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ArticleComments } from "./ArticleComments";
import { DEMO_READER_COMMENTS } from "./readerComments.data";

describe("ArticleComments (demo mode)", () => {
  it("renders every top-level demo comment and its replies", async () => {
    render(
      <TestProviders>
        <ArticleComments articleSlug="any-slug" />
      </TestProviders>,
    );

    for (const comment of DEMO_READER_COMMENTS) {
      expect(await screen.findByText(comment.body)).toBeInTheDocument();
      for (const reply of comment.replies) {
        expect(await screen.findByText(reply.body)).toBeInTheDocument();
      }
    }
  });
});
