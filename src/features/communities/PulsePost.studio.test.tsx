import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { Post } from "./community.model";
import { roleLookup } from "./communityPeople";
import { PulsePost } from "./PulsePost";

vi.mock("../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: ({
    target,
    surface,
  }: {
    target: { kind: string; id: string };
    surface: string;
  }) => (
    <div
      data-testid="studio-card"
      data-kind={target.kind}
      data-id={target.id}
      data-surface={surface}
    />
  ),
}));

const RELEASE_ID = "3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10";
const RELEASE_URL = `https://queerpulse.com/studio/album?id=${RELEASE_ID}`;

function makePost(body: string): Post {
  return {
    id: "post-studio",
    author: { initials: "JS", name: "Jonas Silva", tint: "jade" },
    body,
    kind: "post",
    reactions: [{ key: "heart", count: 2 }],
    replies: [],
    createdAt: "2026-10-14T10:00:00.000Z",
    communitySlug: "trans-hub",
  };
}

function renderPost(body: string) {
  return render(
    <TestProviders>
      <PulsePost
        post={makePost(body)}
        roleOf={roleLookup([])}
        isMember
        viewer={null}
      />
    </TestProviders>,
  );
}

describe("PulsePost with a Studio link", () => {
  it("shows the words without the link and the card under them", () => {
    renderPost(`new one from Coro\n\n${RELEASE_URL}`);
    expect(screen.getByText("new one from Coro")).toBeInTheDocument();
    expect(screen.queryByText(/studio\/album/)).toBeNull();
    const card = screen.getByTestId("studio-card");
    expect(card).toHaveAttribute("data-kind", "release");
    expect(card).toHaveAttribute("data-surface", "post");
  });

  it("renders no empty paragraph for a post that is only the link", () => {
    const { container } = renderPost(RELEASE_URL);
    expect(screen.getByTestId("studio-card")).toBeInTheDocument();
    const paragraphs = [...container.querySelectorAll("p")];
    expect(paragraphs.some((paragraph) => paragraph.textContent === "")).toBe(
      false,
    );
  });
});
