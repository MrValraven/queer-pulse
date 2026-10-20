import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { HubPulseCard, type HubPost } from "./HubPulseCard";

const RELEASE_URL =
  "https://queerpulse.com/studio/album?id=3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";

function hubItem(body: string): HubPost {
  return {
    communityName: "Trans & Non-Binary Hub",
    communitySlug: "trans-hub",
    post: {
      id: "hub-p-studio",
      author: { initials: "JS", name: "Jonas Silva", tint: "jade" },
      body,
      kind: "post",
      reactions: [{ key: "heart", count: 1, reacted: false }],
      replies: [],
      time: "3h",
      communitySlug: "trans-hub",
    },
  };
}

function renderCard(body: string) {
  return render(
    <TestProviders>
      <HubPulseCard item={hubItem(body)} />
    </TestProviders>,
  );
}

describe("HubPulseCard with a Studio link", () => {
  it("names the card for a post that is only the link", () => {
    renderCard(RELEASE_URL);
    expect(screen.getByText("Studio release")).toBeInTheDocument();
  });

  it("shows a markdown-labelled link as its label", () => {
    renderCard(`listen to [the EP](${RELEASE_URL}) tonight`);
    expect(screen.getByText("listen to the EP tonight")).toBeInTheDocument();
    expect(screen.queryByText(/\]\(/)).toBeNull();
  });

  it("renders no body line for a post with neither words nor a link", () => {
    const { container } = renderCard("");
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
