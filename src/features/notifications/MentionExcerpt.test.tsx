import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { MentionExcerpt } from "./MentionExcerpt";

const UNAVAILABLE = "The original text is no longer available.";

function renderExcerpt(
  content: Parameters<typeof MentionExcerpt>[0]["content"],
) {
  return render(
    <TestProviders>
      <MentionExcerpt content={content} />
    </TestProviders>,
  );
}

/**
 * ENG-411. The mentions inbox now serves `excerpt: ""` for a source that was
 * deleted, edited or taken down, and the row shows a muted notice there.
 */
describe("MentionExcerpt", () => {
  it("renders the excerpt when there is one", () => {
    renderExcerpt("Ana said you should come to the picnic");
    expect(
      screen.getByText("Ana said you should come to the picnic"),
    ).toBeInTheDocument();
    expect(screen.queryByText(UNAVAILABLE)).not.toBeInTheDocument();
  });

  it.each(["", "   ", null, undefined])(
    "shows the unavailable notice for an empty excerpt (%j)",
    (content) => {
      renderExcerpt(content);
      expect(screen.getByText(UNAVAILABLE)).toBeInTheDocument();
    },
  );
});
