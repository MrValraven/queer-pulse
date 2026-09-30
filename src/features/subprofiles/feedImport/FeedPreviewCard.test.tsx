import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { FeedPreviewDTO } from "../api/subprofileFeeds.api";
import { FeedPreviewCard } from "./FeedPreviewCard";

const PREVIEW: FeedPreviewDTO = {
  feedUrl: "https://feeds.example.com/rss",
  title: "Late Bloomers",
  author: null,
  description: null,
  episodeCount: 1,
  latest: [
    {
      guid: "g1",
      title: "Hello, late bloomers",
      description: null,
      link: null,
      publishedAt: "2026-02-02T07:00:00.000Z",
      durationSeconds: 4320,
      season: 1,
      episode: 1,
    },
  ],
  alreadyConnected: false,
};

describe("FeedPreviewCard", () => {
  it("shows an episode's date, length and episode number", async () => {
    render(
      <TestProviders>
        <FeedPreviewCard preview={PREVIEW} />
      </TestProviders>,
    );
    expect(await screen.findByText(/1 h 12 min/)).toHaveTextContent(
      /2026.*1 h 12 min · S1 · E1/,
    );
    expect(await screen.findByText("1 episode")).toBeInTheDocument();
  });

  it("falls back to a name when the feed has no channel title", async () => {
    render(
      <TestProviders>
        <FeedPreviewCard preview={{ ...PREVIEW, title: "" }} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", { name: "Untitled show" }),
    ).toBeInTheDocument();
  });
});
