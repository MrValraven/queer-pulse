import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ForumPostLinkCard } from "./ForumPostLinkCard";
import type { ForumPostLink } from "./forumPostLink";

vi.mock("../studio/share/LazyStudioShareCard", () => ({
  LazyStudioShareCard: () => <div data-testid="studio-share-card" />,
}));

const STUDIO_LINK: ForumPostLink = {
  visibleText: "Diogo you'll want this one",
  studioTarget: {
    kind: "track",
    id: "3f0c2a52-8d1e-4c6b-9a57-2b7f1e9d4c10",
    startAtSeconds: null,
  },
  previewUrl: null,
};

function renderCard(isEnabled: boolean) {
  return render(
    <TestProviders>
      <ForumPostLinkCard link={STUDIO_LINK} isEnabled={isEnabled} />
    </TestProviders>,
  );
}

describe("ForumPostLinkCard with a Studio link", () => {
  it("holds the fixed frame and loads nothing until the post is enabled", () => {
    const { container } = renderCard(false);
    expect(screen.queryByTestId("studio-share-card")).toBeNull();
    const frame = container.querySelector('[data-studio-share-frame="post"]');
    expect(frame).not.toBeNull();
    expect(frame?.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("mounts the Studio card once the post is enabled", () => {
    renderCard(true);
    expect(screen.getByTestId("studio-share-card")).toBeInTheDocument();
  });
});
