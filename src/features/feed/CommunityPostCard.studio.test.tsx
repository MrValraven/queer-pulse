import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { HubPost } from "../communities/HubPulseCard";
import { CommunityPostCard } from "./CommunityPostCard";
import type { FeedPost } from "./feed.data";

vi.mock("../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
    surface,
  }: {
    target: { kind: string };
    surface: string;
  }) => (
    <div
      data-testid="studio-card"
      data-kind={target.kind}
      data-surface={surface}
    />
  ),
}));

const RELEASE_ID = "3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";

const livePost: FeedPost = {
  id: "post-1",
  slug: "jonas",
  authorName: "Jonas Silva",
  authorInitials: "JS",
  authorTint: "jade",
  time: "2h",
  context: "Trans & Non-Binary Hub",
  body: "Sharing this one https://queerpulse.com/studio/alb…",
  likeCount: 3,
  replies: [],
  link: "/community/trans-hub/post/post-1",
  studioLink: `/studio/album?id=${RELEASE_ID}`,
};

function renderCard(props: { post?: FeedPost; hub?: HubPost }) {
  return render(
    <TestProviders>
      <CommunityPostCard {...props} />
    </TestProviders>,
  );
}

describe("CommunityPostCard with a Studio link", () => {
  it("drops a cut URL from the summary and shows the card under it", () => {
    renderCard({ post: livePost });
    // The kept words carry the ellipsis that says the summary goes on.
    expect(screen.getByText("Sharing this one…")).toBeInTheDocument();
    expect(screen.queryByText(/studio\/alb/)).toBeNull();
    expect(screen.getByTestId("studio-card")).toHaveAttribute(
      "data-surface",
      "post",
    );
  });

  it("shows the summary as sent when the server sends null", () => {
    renderCard({
      post: { ...livePost, body: "see you Sunday", studioLink: null },
    });
    expect(screen.getByText("see you Sunday")).toBeInTheDocument();
    expect(screen.queryByTestId("studio-card")).toBeNull();
  });

  it("finds the link in a demo hub post's full body", () => {
    renderCard({
      hub: {
        communityName: "Trans & Non-Binary Hub",
        communitySlug: "trans-hub",
        post: {
          id: "hub-p-studio",
          author: { initials: "JS", name: "Jonas Silva", tint: "jade" },
          body: `a new one from Coro\n\nhttps://queerpulse.com/studio/album?id=${RELEASE_ID}`,
          kind: "post",
          reactions: [{ key: "heart", count: 1 }],
          replies: [],
          time: "3h",
          communitySlug: "trans-hub",
        },
      },
    });
    expect(screen.getByText("a new one from Coro")).toBeInTheDocument();
    expect(screen.getByTestId("studio-card")).toHaveAttribute(
      "data-kind",
      "release",
    );
  });

  it("renders no empty quote for a post that is only the link", () => {
    const { container } = renderCard({
      post: {
        ...livePost,
        body: `https://queerpulse.com/studio/album?id=${RELEASE_ID}`,
      },
    });
    const paragraphs = [...container.querySelectorAll("p")];
    expect(paragraphs.some((paragraph) => paragraph.textContent === "")).toBe(
      false,
    );
  });
});
