import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { TopicPostCard } from "./TopicPostCard";
import type { TopicPost } from "./topics.data";

/**
 * The topic-feed post card (X-2 — topics had zero tests). The card carries two
 * bits of real presentational logic worth pinning: it maps each `PostKind` to a
 * translated label chip (KIND_LABEL_KEY), and it flags the post tag that
 * matches the topic's own tag as a highlighted "match". Everything else is
 * straight data pass-through.
 *
 * Rendered in TestProviders (demo) because the card is a router `<Link>` and
 * embeds a MemberStaffBadge that reads app providers; with no `authorSlug` the
 * badge resolves to nothing, keeping this focused on the card itself.
 *
 * i18n note: `topics` is a lazy namespace → `findBy*` for the kind label.
 */
function makePost(overrides: Partial<TopicPost> = {}): TopicPost {
  return {
    author: "Rui Tavares",
    initials: "RT",
    tone: "coral",
    meta: "2 hours ago · Trans & Non-Binary Network",
    kind: "warn",
    category: "thread",
    title: "Heads up about the Rua Nova pop-up",
    body: "The venue moved — new address inside.",
    stats: "12 replies",
    tags: ["safety", "lisboa"],
    href: "#thread",
    ...overrides,
  };
}

describe("TopicPostCard", () => {
  it("maps the post kind to its translated label chip", async () => {
    render(
      <TestProviders>
        <TopicPostCard post={makePost({ kind: "warn" })} topicTag="safety" />
      </TestProviders>,
    );

    // "warn" → topics:postKind.warn → "Warn" once the namespace loads.
    expect(await screen.findByText("Warn")).toBeInTheDocument();
    // Core content passes straight through.
    expect(
      screen.getByText("Heads up about the Rua Nova pop-up"),
    ).toBeInTheDocument();
  });

  it("renders every tag and marks the one matching the topic", async () => {
    render(
      <TestProviders>
        <TopicPostCard
          post={makePost({ tags: ["safety", "lisboa"] })}
          topicTag="safety"
        />
      </TestProviders>,
    );

    // Both tags render with the leading hash.
    expect(await screen.findByText("#safety")).toBeInTheDocument();
    expect(screen.getByText("#lisboa")).toBeInTheDocument();
    // The whole card is a single navigable link.
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
