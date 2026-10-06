import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ReportModal } from "./FeedModeration";

describe("ReportModal on a feed post", () => {
  it("leaves the Funding & Grants scam reason off, keeping the post reasons", () => {
    render(
      <TestProviders>
        <ReportModal
          authorName="Rui Cardoso"
          subjectId="post-1"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(screen.getByText("Spam or self-promotion")).toBeInTheDocument();
    expect(
      screen.queryByText("Scam, fake fundraiser or fake grant"),
    ).toBeNull();
  });
});
