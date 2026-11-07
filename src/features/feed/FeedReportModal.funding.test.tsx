import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
import { ReportModal } from "./FeedModeration";

describe("ReportModal on a feed post", () => {
  it("leaves the Funding & Grants scam reason off, keeping the post reasons", async () => {
    render(
      <TestProviders>
        <ReportModal
          authorName="Rui Cardoso"
          subjectId="post-1"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    await awaitCatalog("feed", "safety");
    expect(screen.getByText("Spam or self-promotion")).toBeInTheDocument();
    expect(
      screen.queryByText("Scam, fake fundraiser or fake grant"),
    ).toBeNull();
  });
});
