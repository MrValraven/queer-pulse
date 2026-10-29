import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { DirectoryReportModal } from "./DirectoryReportModal";

/**
 * A review has exactly one author, so the report heading names them. The
 * reasons come from the shared `review` taxonomy. `marketing` is a lazy
 * namespace, so these are `findBy`.
 */

describe("DirectoryReportModal", () => {
  it("still names the author when reporting a review", async () => {
    render(
      <TestProviders>
        <DirectoryReportModal
          subjectId="review-1"
          subjectKind="review"
          authorName="Ana Silva"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(await screen.findByText(/Ana's review/i)).toBeInTheDocument();
  });

  it("offers a review the review reasons", async () => {
    render(
      <TestProviders>
        <DirectoryReportModal
          subjectId="review-1"
          subjectKind="review"
          authorName="Ana Silva"
          onClose={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("radio", { name: /Scam or fake listing/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /Outing/i }),
    ).not.toBeInTheDocument();
  });
});
