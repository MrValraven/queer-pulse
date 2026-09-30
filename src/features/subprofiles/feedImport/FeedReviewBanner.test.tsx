import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { resetDemoFeedsForTests } from "../data/subprofileFeedsDemo";
import { FeedReviewBanner } from "./FeedReviewBanner";
import { demoPodcastView } from "./feedImportTestData";

beforeEach(resetDemoFeedsForTests);
afterEach(resetDemoFeedsForTests);

describe("FeedReviewBanner (demo mode)", () => {
  it("nudges when a feed has episodes waiting, linking to the persona's Import pane", async () => {
    const podcast = demoPodcastView();
    render(
      <TestProviders>
        <FeedReviewBanner subprofiles={[podcast]} />
      </TestProviders>,
    );
    expect(await screen.findByText(/5 new episodes from/i)).toHaveTextContent(
      "5 new episodes from Late Bloomers are ready to review",
    );
    expect(
      screen.getByRole("link", { name: "Review episodes" }),
    ).toHaveAttribute(
      "href",
      `/account/subprofiles/${podcast.id}/edit?pane=import`,
    );
  });

  it("renders nothing for personas whose kind cannot import a feed", () => {
    const { kind: _kind, ...rest } = demoPodcastView();
    render(
      <TestProviders>
        <FeedReviewBanner subprofiles={[{ ...rest, kind: "developer" }]} />
      </TestProviders>,
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});
