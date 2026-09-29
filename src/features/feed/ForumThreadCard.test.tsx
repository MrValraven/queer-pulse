import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ForumThreadCard } from "./ForumThreadCard";
import type { FeedItem } from "./api/feed.api";

/**
 * The feed's forum card (ENG-417, ENG-420, DES-404): a masked byline shows
 * the mask's own name with no profile link, a warned excerpt stays covered
 * until the reader asks, and the meta line is built in the reader's language
 * from the raw category key.
 */
const baseThreadItem = (overrides: Partial<FeedItem> = {}): FeedItem => ({
  id: "thread-1",
  type: "forum_thread",
  createdAt: "2026-08-04T11:00:00.000Z",
  title: "Where to find a flat in Porto",
  summary: "housing · 3 replies",
  link: "/thread/flat-in-porto",
  actor: { handle: "noor", displayName: "Noor Haddad", avatarUrl: null },
  replyCount: 3,
  ...overrides,
});

function renderCard(item: FeedItem) {
  return render(
    <TestProviders>
      <ForumThreadCard item={item} />
    </TestProviders>,
  );
}

describe("ForumThreadCard", () => {
  it("renders the anonymous byline with no profile link", () => {
    // The server sends a null actor for a masked thread. A stale actor is
    // left on the fixture to prove the card trusts the mask over it.
    renderCard(baseThreadItem({ bylineMask: "anonymous" }));

    expect(screen.getAllByText("A member").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Noor Haddad/)).not.toBeInTheDocument();
    const profileLinks = screen
      .queryAllByRole("link")
      .filter((link) => link.getAttribute("href")?.includes("noor"));
    expect(profileLinks).toHaveLength(0);
    expect(
      screen.queryByRole("link", { name: /profile/i }),
    ).not.toBeInTheDocument();
    // One letter, the forum's anonymous avatar, so it never reads as a
    // member's initials.
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("AM")).not.toBeInTheDocument();
  });

  it("renders the official byline with the brand mark and the Official badge", () => {
    renderCard(baseThreadItem({ bylineMask: "official" }));

    expect(screen.getByText("QueerPulse")).toBeInTheDocument();
    expect(screen.getByText("Official")).toBeInTheDocument();
    expect(screen.queryByText("Q")).not.toBeInTheDocument();
    expect(screen.queryByText(/Noor Haddad/)).not.toBeInTheDocument();
  });

  it("names an unmasked thread with no actor the way the forum does", () => {
    renderCard(baseThreadItem({ actor: null }));

    expect(screen.getByText("A member")).toBeInTheDocument();
  });

  it("covers a warned excerpt until the reveal is pressed", async () => {
    const user = userEvent.setup();
    renderCard(
      baseThreadItem({
        id: "thread-warned",
        link: "/thread/a-hard-week",
        excerpt: "A hard week at the clinic.",
        contentWarnings: ["Grief"],
      }),
    );

    const excerpt = screen.getByText("A hard week at the clinic.", {
      selector: "p",
    });
    expect(excerpt).toHaveAttribute("aria-hidden", "true");

    // The pill lists the warnings once; the reveal points at it.
    const reveal = screen.getByRole("button", { name: "Show it anyway" });
    expect(reveal).toHaveAttribute("aria-expanded", "false");
    expect(reveal).toHaveAccessibleDescription("Warning · Grief");
    expect(screen.getAllByText(/Grief/)).toHaveLength(1);
    await user.click(reveal);

    expect(excerpt).not.toHaveAttribute("aria-hidden");
    expect(screen.getByRole("button", { name: "Hide again" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("shows the warning pill on a warned thread with no excerpt", () => {
    renderCard(
      baseThreadItem({
        id: "thread-warned-no-excerpt",
        link: "/thread/warned-no-excerpt",
        excerpt: null,
        contentWarnings: ["Grief"],
      }),
    );

    expect(screen.getByText("Warning · Grief")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Show it anyway" }),
    ).not.toBeInTheDocument();
  });

  it("keys the reveal on the thread slug the forum uses", async () => {
    const user = userEvent.setup();
    const warnedItem = baseThreadItem({
      id: "thread-shared-key",
      link: "/thread/shared-key",
      excerpt: "Remembered across surfaces.",
      contentWarnings: ["Grief"],
    });
    const firstRender = renderCard(warnedItem);
    await user.click(screen.getByRole("button", { name: "Show it anyway" }));
    firstRender.unmount();

    // Another item for the same thread (same slug, different feed id) opens
    // already uncovered, because the choice is stored under the slug.
    renderCard({ ...warnedItem, id: "thread-shared-key-again" });

    expect(
      screen.getByText("Remembered across surfaces.", { selector: "p" }),
    ).not.toHaveAttribute("aria-hidden");
  });

  it("shows the translated category and a pluralised reply count", () => {
    renderCard(baseThreadItem({ category: "housing", replyCount: 3 }));

    expect(screen.getByText("Housing · 3 replies")).toBeInTheDocument();
    expect(screen.queryByText("housing · 3 replies")).not.toBeInTheDocument();
  });

  it("falls back to summary when category is missing", () => {
    renderCard(
      baseThreadItem({ category: undefined, summary: "Nightlife · 1 reply" }),
    );

    expect(screen.getByText("Nightlife · 1 reply")).toBeInTheDocument();
  });

  it("offers no like button when the item carries no opening post id", () => {
    renderCard(baseThreadItem({ opPostId: null }));

    expect(
      screen.queryByRole("button", { name: "Like this thread" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove your like" }),
    ).not.toBeInTheDocument();
  });

  it("shows the opening post's vote count on an unliked thread (FEED-LIKE)", () => {
    renderCard(
      baseThreadItem({
        opPostId: "post-1",
        reactionCount: 4,
        myReaction: null,
      }),
    );

    const likeButton = screen.getByRole("button", { name: "Like this thread" });
    expect(likeButton).toHaveAttribute("aria-pressed", "false");
    expect(likeButton).toHaveTextContent("4");
  });

  it("shows an already-liked thread as pressed (FEED-LIKE)", () => {
    renderCard(
      baseThreadItem({
        opPostId: "post-1",
        reactionCount: 5,
        myReaction: "like",
      }),
    );

    const likeButton = screen.getByRole("button", { name: "Remove your like" });
    expect(likeButton).toHaveAttribute("aria-pressed", "true");
    expect(likeButton).toHaveTextContent("5");
  });
});
